const Order = require('../models/Order.model');
const OrderNotification = require('../models/OrderNotification.model');
const {
  getBrevoTransporter,
  isOrderEmailConfigured,
  getOrderMailConfig,
} = require('../config/brevoMailer');
const renderInvoiceToBuffer = require('../utils/invoiceBuffer');
const templates = require('../templates/orderEmail.template');

// Style4U recipient — verified existing address (see utils/generateInvoice.js).
const STYLE4U_FALLBACK_EMAIL = 'style4ufbd@gmail.com';

// Lease duration for an in-flight claim. Must exceed the worst-case send time
// (invoice render timeout 20s + SMTP socket timeout 15s + DB writes) so an
// active worker is never mistaken for a stale one. 5 minutes is a wide margin.
const RETRY_LEASE_MS = 5 * 60 * 1000;

const leaseDeadline = (now) => new Date(now.getTime() + RETRY_LEASE_MS);

// Shared eligibility filter for the atomic claim and the retry sweep: records
// that failed, or "sending" records whose lease is missing or expired. A
// "sending" record with a future lease is owned by an active worker and is
// deliberately excluded.
const retryEligibilityFilter = (now) => ({
  status: { $in: ['failed', 'sending'] },
  $or: [{ leaseUntil: null }, { leaseUntil: { $lte: now } }],
});

// Populate the same user fields the invoice generator relies on.
const USER_FIELDS =
  'name dealershipName phone email address city state code';

const loadOrderForEmail = (orderId) =>
  Order.findById(orderId).populate('user', USER_FIELDS);

const resolveOrderId = (orderInput) =>
  orderInput && orderInput._id ? orderInput._id : orderInput;

const getRecipients = (order) => {
  const recipients = new Set();

  const eddal = process.env.ORDER_EMAIL_EDDAL;
  const style4u = process.env.ORDER_EMAIL_STYLE4U || STYLE4U_FALLBACK_EMAIL;

  if (eddal && eddal.trim()) recipients.add(eddal.trim().toLowerCase());
  if (style4u && style4u.trim()) recipients.add(style4u.trim().toLowerCase());

  const dealerEmail = order && order.user && order.user.email;
  if (dealerEmail && String(dealerEmail).trim()) {
    recipients.add(String(dealerEmail).trim().toLowerCase());
  }

  return [...recipients];
};

const getFromAddress = () => {
  const { user } = getOrderMailConfig();
  const address = process.env.ORDER_EMAIL_FROM || user;
  const name = process.env.ORDER_EMAIL_FROM_NAME || 'Style4U';
  return { name, address };
};

const buildContent = (order, key) => {
  if (key === 'order_confirmation') {
    return {
      subject: `Order Confirmation - ${order.orderId}`,
      html: templates.orderConfirmationTemplate(order),
      attachInvoice: true,
    };
  }

  if (key === 'sponsored_order') {
    return {
      subject: `Sponsored Order Confirmation - ${order.orderId}`,
      html: templates.sponsoredOrderTemplate(order),
      attachInvoice: true,
    };
  }

  if (key.startsWith('status_update:')) {
    const newStatus = key.slice('status_update:'.length);
    return {
      subject: `Order ${order.orderId} - Status: ${newStatus}`,
      html: templates.statusUpdateTemplate(order, { newStatus }),
      attachInvoice: false,
    };
  }

  return {
    subject: `Order ${order.orderId}`,
    html: templates.orderConfirmationTemplate(order),
    attachInvoice: false,
  };
};

// Atomically claim an event. Returns the notification doc if this call won the
// claim, or null when the event was already handled (duplicate-key 11000).
const claimNotification = async (orderId, key, type) => {
  try {
    return await OrderNotification.create({
      order: orderId,
      key,
      type,
      status: 'sending',
      leaseUntil: leaseDeadline(new Date()),
    });
  } catch (error) {
    if (error && error.code === 11000) return null;
    throw error;
  }
};

// Atomically claim an existing notification for retry. The conditional
// findOneAndUpdate performs the eligibility check and the state transition in
// a single document operation, so two concurrent workers cannot both win the
// same record — the loser receives null. Increments attempts and installs a
// fresh lease on success.
const claimForRetry = async (notificationId) => {
  const now = new Date();
  return OrderNotification.findOneAndUpdate(
    { _id: notificationId, ...retryEligibilityFilter(now) },
    {
      $set: { status: 'sending', leaseUntil: leaseDeadline(now) },
      $inc: { attempts: 1 },
    },
    { new: true }
  );
};

// Deliver an already-claimed notification. Records outcome; never throws.
const deliver = async (notification, order) => {
  const recipients = getRecipients(order);
  const { subject, html, attachInvoice } = buildContent(order, notification.key);

  try {
    if (!isOrderEmailConfigured()) {
      throw new Error('Brevo SMTP is not configured');
    }
    if (!recipients.length) {
      throw new Error('No recipients resolved');
    }

    const attachments = [];
    if (attachInvoice) {
      const pdf = await renderInvoiceToBuffer(order);
      attachments.push({
        filename: `Invoice-${order.orderId}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      });
    }

    const info = await getBrevoTransporter().sendMail({
      from: getFromAddress(),
      to: recipients,
      subject,
      html,
      attachments,
    });

    notification.status = 'sent';
    notification.to = recipients;
    notification.messageId = info && info.messageId ? info.messageId : undefined;
    notification.sentAt = new Date();
    notification.error = undefined;
    notification.leaseUntil = null;
    await notification.save();

    return { sent: true, messageId: notification.messageId, to: recipients };
  } catch (error) {
    notification.status = 'failed';
    notification.to = recipients;
    notification.error = String(error && error.message ? error.message : error);
    notification.leaseUntil = null;

    try {
      await notification.save();
    } catch (saveError) {
      console.error(
        'Failed to record order notification outcome:',
        saveError.message
      );
    }

    return { sent: false, error: notification.error };
  }
};

// Public: send a notification for an event key (claim + deliver). Never throws.
const notify = async (orderInput, key, type) => {
  try {
    const orderId = resolveOrderId(orderInput);
    if (!orderId) return { sent: false, error: 'Order id is required' };

    const order = await loadOrderForEmail(orderId);
    if (!order) return { sent: false, error: 'Order not found' };

    const notification = await claimNotification(order._id, key, type);
    if (!notification) return { skipped: true, reason: 'duplicate' };

    return await deliver(notification, order);
  } catch (error) {
    console.error('Order email notification failed:', error.message);
    return { sent: false, error: error.message };
  }
};

// Regular dealer order — only after payment verification has succeeded.
const sendOrderConfirmation = async (orderInput) => {
  const orderId = resolveOrderId(orderInput);
  const order = orderId ? await loadOrderForEmail(orderId).catch(() => null) : null;

  if (order && order.paymentStatus !== 'paid') {
    return { skipped: true, reason: 'payment not verified' };
  }

  return notify(orderInput, 'order_confirmation', 'order_confirmation');
};

// Sponsored order — persisted as paid on creation.
const sendSponsoredOrderConfirmation = async (orderInput) =>
  notify(orderInput, 'sponsored_order', 'sponsored_order');

// Status update — only when the status genuinely changed.
const sendOrderStatusUpdate = async (orderInput, { newStatus } = {}) => {
  const orderId = resolveOrderId(orderInput);
  const order = orderId ? await loadOrderForEmail(orderId).catch(() => null) : null;
  const status = newStatus || (order && order.status);

  if (!status) return { skipped: true, reason: 'no status' };

  return notify(orderInput, `status_update:${status}`, 'status_update');
};

// ─── Safe retry path ───────────────────────────────────────────────────
// Re-sends a previously failed (or interrupted) notification. It reads the
// stored order only — it never re-runs payment or order operations. The claim
// is atomic: concurrent callers cannot both process the same notification.
const retryNotification = async (notificationId) => {
  try {
    const notification = await claimForRetry(notificationId);

    if (!notification) {
      const existing = await OrderNotification.findById(notificationId).select(
        'status leaseUntil'
      );
      if (!existing) return { sent: false, error: 'Notification not found' };
      if (existing.status === 'sent') {
        return { skipped: true, reason: 'already sent' };
      }
      return { skipped: true, reason: 'already claimed' };
    }

    const order = await loadOrderForEmail(notification.order);

    if (!order) {
      notification.status = 'failed';
      notification.error = 'Order not found';
      notification.leaseUntil = null;
      await notification.save().catch(() => {});
      return { sent: false, error: 'Order not found' };
    }

    return await deliver(notification, order);
  } catch (error) {
    console.error('Order email retry failed:', error.message);
    return { sent: false, error: error.message };
  }
};

const retryFailedNotifications = async (limit = 25) => {
  const notifications = await OrderNotification.find(retryEligibilityFilter(new Date()))
    .sort({ createdAt: 1 })
    .limit(limit);

  const results = [];
  for (const notification of notifications) {
    results.push({
      id: notification._id,
      ...(await retryNotification(notification._id)),
    });
  }
  return results;
};

module.exports = {
  sendOrderConfirmation,
  sendSponsoredOrderConfirmation,
  sendOrderStatusUpdate,
  retryNotification,
  retryFailedNotifications,
};

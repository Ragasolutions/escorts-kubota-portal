const Order = require('../models/Order.model');
const OrderNotification = require('../models/OrderNotification.model');
const {
  sendBrevoEmail,
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
const claimNotification = async (orderId, key, type, options = {}) => {
  const corrId = options.correlationId || 'unknown';
  const orderIdRedacted = `***${String(orderId).slice(-6)}`;
  try {
    const claimStart = Date.now();
    const doc = await OrderNotification.create({
      order: orderId,
      key,
      type,
      status: 'sending',
      leaseUntil: leaseDeadline(new Date()),
    });
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:claim_succeeded] [corrId:${corrId}] [orderId:${orderIdRedacted}] Notification claimed successfully (key:${key}, notifId:${doc._id}, duration:${Date.now() - claimStart}ms)`);
    return doc;
  } catch (error) {
    if (error && error.code === 11000) {
      console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:claim_skipped] [corrId:${corrId}] [orderId:${orderIdRedacted}] Notification claim skipped: duplicate/already exists (key:${key})`);
      return null;
    }
    console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:claim_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] Notification claim database error (key:${key}): ${error.message}`);
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
const deliver = async (notification, order, options = {}) => {
  const corrId = options.correlationId || 'unknown';
  const orderIdRedacted = `***${String(order?._id || notification?.order).slice(-6)}`;
  const deliverStart = Date.now();

  const recipients = getRecipients(order);
  const { subject, html, attachInvoice } = buildContent(order, notification.key);

  try {
    if (!isOrderEmailConfigured()) {
      console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:config_check_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] BREVO_API_KEY is not configured in environment`);
      throw new Error('BREVO_API_KEY is not configured');
    }
    if (!recipients.length) {
      console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:recipients_check_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] No recipients resolved`);
      throw new Error('No recipients resolved');
    }

    const attachments = [];
    if (attachInvoice) {
      const invStart = Date.now();
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:invoice_gen_start] [corrId:${corrId}] [orderId:${orderIdRedacted}] Invoice PDF generation started`);
      try {
        const pdf = await renderInvoiceToBuffer(order);
        const invDuration = Date.now() - invStart;
        console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:invoice_gen_complete] [corrId:${corrId}] [orderId:${orderIdRedacted}] Invoice PDF generated (duration:${invDuration}ms, bytes:${pdf.length})`);
        attachments.push({
          filename: `Invoice-${order.orderId}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        });
      } catch (invErr) {
        const invDuration = Date.now() - invStart;
        console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:invoice_gen_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] Invoice PDF generation failed (duration:${invDuration}ms): ${invErr.message}`);
        throw invErr;
      }
    }

    const mailConfig = getOrderMailConfig();
    const sendStart = Date.now();
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_send_start] [corrId:${corrId}] [orderId:${orderIdRedacted}] Brevo HTTPS API send initiating (sender:${mailConfig.fromEmail ? 'configured' : 'missing'}, recipientCount:${recipients.length})`);

    const info = await sendBrevoEmail({
      from: getFromAddress(),
      to: recipients,
      subject,
      html,
      attachments,
    });

    const sendDuration = Date.now() - sendStart;
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_send_success] [corrId:${corrId}] [orderId:${orderIdRedacted}] Brevo HTTPS API send succeeded (duration:${sendDuration}ms, messageId:${info && info.messageId ? info.messageId : 'none'})`);

    notification.status = 'sent';
    notification.to = recipients;
    notification.messageId = info && info.messageId ? info.messageId : undefined;
    notification.sentAt = new Date();
    notification.error = undefined;
    notification.leaseUntil = null;

    const persistStart = Date.now();
    await notification.save();
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:notification_persist_complete] [corrId:${corrId}] [orderId:${orderIdRedacted}] Notification status persisted as 'sent' (duration:${Date.now() - persistStart}ms, deliverTotal:${Date.now() - deliverStart}ms)`);

    return { sent: true, messageId: notification.messageId, to: recipients };
  } catch (error) {
    const errorStage = attachments.length === 0 && attachInvoice ? 'invoice_gen_or_prep' : 'email_send_api';
    const errCode = error && error.code ? error.code : 'none';
    const errCommand = error && error.command ? error.command : 'none';
    const errRespCode = error && error.responseCode ? error.responseCode : 'none';
    const errName = error && error.name ? error.name : 'Error';
    const safeMsg = String(error && error.message ? error.message : error).replace(/[\r\n]+/g, ' ');

    console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_send_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] Email delivery failure (stage:${errorStage}, errName:${errName}, errCode:${errCode}, command:${errCommand}, responseCode:${errRespCode}, msg:${safeMsg})`);

    notification.status = 'failed';
    notification.to = recipients;
    notification.error = String(error && error.message ? error.message : error);
    notification.leaseUntil = null;

    const persistStart = Date.now();
    try {
      await notification.save();
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:notification_persist_complete] [corrId:${corrId}] [orderId:${orderIdRedacted}] Notification status persisted as 'failed' (duration:${Date.now() - persistStart}ms, deliverTotal:${Date.now() - deliverStart}ms)`);
    } catch (saveError) {
      console.error(
        `[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:notification_persist_failed] [corrId:${corrId}] [orderId:${orderIdRedacted}] Failed to record order notification outcome (duration:${Date.now() - persistStart}ms): ${saveError.message}`
      );
    }

    return { sent: false, error: notification.error };
  }
};

// Public: send a notification for an event key (claim + deliver). Never throws.
const notify = async (orderInput, key, type, options = {}) => {
  const notifyStart = Date.now();
  const corrId = options.correlationId || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  try {
    const orderId = resolveOrderId(orderInput);
    const orderIdRedacted = `***${String(orderId || 'none').slice(-6)}`;

    if (!orderId) {
      console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:notify_aborted] [corrId:${corrId}] Order id is required`);
      return { sent: false, error: 'Order id is required' };
    }

    const order = await loadOrderForEmail(orderId);
    if (!order) {
      console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:notify_aborted] [corrId:${corrId}] [orderId:${orderIdRedacted}] Order not found`);
      return { sent: false, error: 'Order not found' };
    }

    const notification = await claimNotification(order._id, key, type, { correlationId: corrId });
    if (!notification) {
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_finished] [corrId:${corrId}] [orderId:${orderIdRedacted}] Email skipped (reason: duplicate, duration:${Date.now() - notifyStart}ms)`);
      return { skipped: true, reason: 'duplicate' };
    }

    const result = await deliver(notification, order, { correlationId: corrId });
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_finished] [corrId:${corrId}] [orderId:${orderIdRedacted}] Email finished (sent:${Boolean(result?.sent)}, status:${result?.sent ? 'sent' : 'failed'}, totalDuration:${Date.now() - notifyStart}ms)`);
    return result;
  } catch (error) {
    console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_finished] [corrId:${corrId}] Order email notification top-level error (totalDuration:${Date.now() - notifyStart}ms): ${error.message}`);
    return { sent: false, error: error.message };
  }
};

// Regular dealer order — only after payment verification has succeeded.
const sendOrderConfirmation = async (orderInput, options = {}) => {
  const corrId = options.correlationId || `diag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const orderId = resolveOrderId(orderInput);
  const orderIdRedacted = `***${String(orderId || 'none').slice(-6)}`;

  console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_entered] [corrId:${corrId}] [orderId:${orderIdRedacted}] sendOrderConfirmation entered`);

  const order = orderId ? await loadOrderForEmail(orderId).catch(() => null) : null;

  if (order && order.paymentStatus !== 'paid') {
    console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_eligibility_skipped] [corrId:${corrId}] [orderId:${orderIdRedacted}] Eligibility skipped: payment not verified (status:${order.paymentStatus})`);
    return { skipped: true, reason: 'payment not verified' };
  }

  console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_eligibility_passed] [corrId:${corrId}] [orderId:${orderIdRedacted}] Eligibility passed: order confirmed as paid`);

  return notify(orderInput, 'order_confirmation', 'order_confirmation', { correlationId: corrId });
};

// Sponsored order — persisted as paid on creation.
const sendSponsoredOrderConfirmation = async (orderInput, options = {}) =>
  notify(orderInput, 'sponsored_order', 'sponsored_order', options);

// Status update — only when the status genuinely changed.
const sendOrderStatusUpdate = async (orderInput, { newStatus, correlationId } = {}) => {
  const orderId = resolveOrderId(orderInput);
  const order = orderId ? await loadOrderForEmail(orderId).catch(() => null) : null;
  const status = newStatus || (order && order.status);

  if (!status) return { skipped: true, reason: 'no status' };

  return notify(orderInput, `status_update:${status}`, 'status_update', { correlationId });
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

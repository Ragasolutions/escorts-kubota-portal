// HTML email templates for order-related notifications.
// Values mirror the verified company details used by the invoice generator.

const COMPANY = {
  name: 'STYLE4U',
  address: '1B/183, NIT, FARIDABAD, Faridabad-121001, Haryana',
  phone: '+91 8076422987',
  email: 'style4ufbd@gmail.com',
};

const inr = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const itemsRows = (order) =>
  (order.items || [])
    .map((item, index) => {
      const size = item.size ? ` (Size: ${escapeHtml(item.size)})` : '';
      return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(item.name)}${size}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${inr(item.price)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${inr(item.price * item.quantity)}</td>
        </tr>`;
    })
    .join('');

const summaryRows = (order) => {
  const rows = [
    `<tr><td style="padding:4px 8px;">Basic Amount</td><td style="padding:4px 8px;text-align:right;">${inr(order.basicAmount)}</td></tr>`,
    `<tr><td style="padding:4px 8px;">Rebate (${escapeHtml(order.rebatePercent)}%)</td><td style="padding:4px 8px;text-align:right;">- ${inr(order.rebateAmount)}</td></tr>`,
    `<tr><td style="padding:4px 8px;">${escapeHtml(order.gstType || 'GST')} (${escapeHtml(order.gstPercent)}%)</td><td style="padding:4px 8px;text-align:right;">${inr(order.gstAmount)}</td></tr>`,
    `<tr><td style="padding:8px;font-weight:bold;border-top:1px solid #e5e7eb;">Final Amount</td><td style="padding:8px;text-align:right;font-weight:bold;color:#15803d;border-top:1px solid #e5e7eb;">${inr(order.finalAmount)}</td></tr>`,
  ];
  return rows.join('');
};

const shippingBlock = (order) => {
  const a = order.shippingAddress || {};
  return `
    <p style="margin:2px 0;">${escapeHtml(a.street || '')}</p>
    <p style="margin:2px 0;">${escapeHtml(a.city || '')}${a.city && a.state ? ', ' : ''}${escapeHtml(a.state || '')} ${escapeHtml(a.pincode || '')}</p>
    ${a.phone ? `<p style="margin:2px 0;">Phone: ${escapeHtml(a.phone)}</p>` : ''}`;
};

const layout = (title, bodyHtml) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:640px;margin:0 auto;">
    <div style="background:#f59e0b;color:#111827;padding:16px 20px;">
      <h2 style="margin:0;font-size:20px;">${escapeHtml(COMPANY.name)}</h2>
      <p style="margin:4px 0 0;font-size:12px;">${escapeHtml(COMPANY.address)}</p>
    </div>
    <div style="padding:20px;">
      <h3 style="margin-top:0;">${escapeHtml(title)}</h3>
      ${bodyHtml}
    </div>
    <div style="padding:12px 20px;background:#f9fafb;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
      <p style="margin:0;">${escapeHtml(COMPANY.name)} · ${escapeHtml(COMPANY.phone)} · ${escapeHtml(COMPANY.email)}</p>
    </div>
  </div>`;

const customerBlock = (order) => {
  const user = order.user || {};
  return `
    <p style="margin:2px 0;"><strong>Dealer:</strong> ${escapeHtml(user.name || '')}</p>
    <p style="margin:2px 0;"><strong>Code:</strong> ${escapeHtml(user.code || '')}</p>`;
};

const orderConfirmationTemplate = (order) => {
  const body = `
    <p>Dear ${escapeHtml(order.user?.name || 'Dealer')},</p>
    <p>Thank you for your order. Your payment has been received and your order is confirmed.</p>
    <p style="margin:4px 0;"><strong>Order No.:</strong> ${escapeHtml(order.orderId)}</p>
    <p style="margin:4px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
    <h4 style="margin-bottom:6px;">Order Items</h4>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">#</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Item</th>
          <th style="padding:8px;border:1px solid #e5e7eb;">Qty</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Price</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsRows(order)}</tbody>
    </table>
    <table style="width:100%;font-size:13px;margin-top:12px;">${summaryRows(order)}</table>
    <h4 style="margin-bottom:6px;">Shipping Address</h4>
    ${shippingBlock(order)}
    <p style="margin-top:16px;">The invoice is attached to this email as a PDF.</p>`;
  return layout('Order Confirmation', body);
};

const sponsoredOrderTemplate = (order) => {
  const body = `
    <p>Dear ${escapeHtml(order.user?.name || 'Dealer')},</p>
    <p>A sponsored order has been created for you. Your order is confirmed.</p>
    <p style="margin:4px 0;"><strong>Order No.:</strong> ${escapeHtml(order.orderId)}</p>
    <p style="margin:4px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
    <h4 style="margin-bottom:6px;">Order Items</h4>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">#</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Item</th>
          <th style="padding:8px;border:1px solid #e5e7eb;">Qty</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Price</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsRows(order)}</tbody>
    </table>
    <table style="width:100%;font-size:13px;margin-top:12px;">${summaryRows(order)}</table>
    <h4 style="margin-bottom:6px;">Shipping Address</h4>
    ${shippingBlock(order)}
    <p style="margin-top:16px;">The invoice is attached to this email as a PDF.</p>`;
  return layout('Sponsored Order Confirmation', body);
};

const statusUpdateTemplate = (order, { previousStatus, newStatus, note } = {}) => {
  const body = `
    <p>Dear ${escapeHtml(order.user?.name || 'Dealer')},</p>
    <p>The status of your order has been updated.</p>
    <p style="margin:4px 0;"><strong>Order No.:</strong> ${escapeHtml(order.orderId)}</p>
    ${previousStatus ? `<p style="margin:4px 0;"><strong>Previous Status:</strong> ${escapeHtml(previousStatus)}</p>` : ''}
    <p style="margin:4px 0;"><strong>New Status:</strong> ${escapeHtml(newStatus || order.status)}</p>
    ${note ? `<p style="margin:4px 0;"><strong>Note:</strong> ${escapeHtml(note)}</p>` : ''}
    <h4 style="margin-bottom:6px;">Order Items</h4>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">#</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Item</th>
          <th style="padding:8px;border:1px solid #e5e7eb;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || [])
          .map(
            (item, index) => `
          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;">${index + 1}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(item.name)}${item.size ? ` (Size: ${escapeHtml(item.size)})` : ''}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
    <p style="margin-top:16px;">You can view the latest status in your account order history.</p>`;
  return layout('Order Status Update', body);
};

module.exports = {
  orderConfirmationTemplate,
  sponsoredOrderTemplate,
  statusUpdateTemplate,
};

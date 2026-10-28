// ─── Order-email configuration (Brevo HTTPS API v3) ─────────────────────
// Uses Brevo's official REST API endpoint: https://api.brevo.com/v3/smtp/email
// over HTTPS (port 443), completely eliminating outbound SMTP port restrictions.
// Credentials are read ONLY from environment variables and are never logged.
//
// Required environment variable:
//   BREVO_API_KEY          Brevo REST API v3 key (e.g. xkeysib-...)
// Optional:
//   ORDER_EMAIL_FROM       verified sender address (defaults to BREVO_SMTP_USER)
//   ORDER_EMAIL_FROM_NAME  display name (defaults to "Style4U")
//   ORDER_EMAIL_EDDAL      Eddal recipient address
//   ORDER_EMAIL_STYLE4U    Style4U recipient override (default: style4ufbd@gmail.com)

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_TIMEOUT_MS = 10000;

const getOrderMailConfig = () => {
  return {
    apiKeyConfigured: Boolean(process.env.BREVO_API_KEY),
    fromEmail: process.env.ORDER_EMAIL_FROM || process.env.BREVO_SMTP_USER,
    fromName: process.env.ORDER_EMAIL_FROM_NAME || 'Style4U',
  };
};

const isOrderEmailConfigured = () => {
  return Boolean(process.env.BREVO_API_KEY);
};

/**
 * Sends a transactional email via Brevo's HTTPS API (v3).
 * @param {Object} options
 * @param {Object} [options.from] - { name: string, address: string }
 * @param {string[]} options.to - Array of recipient email strings
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content
 * @param {Array<{filename: string, content: Buffer|string, contentType?: string}>} [options.attachments]
 * @returns {Promise<{ messageId: string }>}
 */
const sendBrevoEmail = async ({ from, to, subject, html, attachments = [] }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const senderEmail = from?.address || process.env.ORDER_EMAIL_FROM || process.env.BREVO_SMTP_USER;
  const senderName = from?.name || process.env.ORDER_EMAIL_FROM_NAME || 'Style4U';

  if (!senderEmail) {
    throw new Error('No sender email configured (set ORDER_EMAIL_FROM or BREVO_SMTP_USER)');
  }

  const toList = (Array.isArray(to) ? to : [to])
    .filter(Boolean)
    .map((recipient) => {
      if (typeof recipient === 'string') return { email: recipient.trim() };
      if (recipient && recipient.email) return { email: recipient.email.trim(), name: recipient.name };
      return null;
    })
    .filter(Boolean);

  if (!toList.length) {
    throw new Error('No valid recipients provided');
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: toList,
    subject,
    htmlContent: html,
  };

  if (attachments && attachments.length > 0) {
    payload.attachment = attachments.map((att) => {
      let base64Content = '';
      if (Buffer.isBuffer(att.content)) {
        base64Content = att.content.toString('base64');
      } else if (typeof att.content === 'string') {
        base64Content = att.content;
      }
      return {
        name: att.filename,
        content: base64Content,
      };
    });
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      responseData?.message ||
      responseData?.error ||
      `Brevo API call failed with status ${response.status} (${response.statusText})`;
    const error = new Error(errorMsg);
    error.name = 'BrevoApiError';
    error.code = responseData?.code || `HTTP_${response.status}`;
    error.responseCode = response.status;
    throw error;
  }

  return {
    messageId: responseData?.messageId || `brevo_api_${Date.now()}`,
  };
};

// Backward-compatibility wrapper for any caller expecting a transporter with sendMail()
const getBrevoTransporter = () => ({
  sendMail: (options) => sendBrevoEmail(options),
});

module.exports = {
  getOrderMailConfig,
  isOrderEmailConfigured,
  sendBrevoEmail,
  getBrevoTransporter,
};

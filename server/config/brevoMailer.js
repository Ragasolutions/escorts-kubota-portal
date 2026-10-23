const nodemailer = require('nodemailer');

// ─── Order-email configuration ─────────────────────────────────────────
// Separate from the contact-form Nodemailer/Gmail setup.
// Credentials are read ONLY from environment variables and are never logged.
//
// Required environment variable names (values are set outside this codebase):
//   BREVO_SMTP_HOST   e.g. smtp-relay.brevo.com
//   BREVO_SMTP_PORT   e.g. 587
//   BREVO_SMTP_USER
//   BREVO_SMTP_PASS
// Optional:
//   BREVO_SMTP_SECURE      "true"/"false" (defaults to true when port is 465)
//   ORDER_EMAIL_FROM       verified sender address (defaults to BREVO_SMTP_USER)
//   ORDER_EMAIL_FROM_NAME  display name (defaults to "Style4U")
//   ORDER_EMAIL_EDDAL      Eddal recipient address
//   ORDER_EMAIL_STYLE4U    Style4U recipient override (default: style4ufbd@gmail.com)

let transporter = null;

const getOrderMailConfig = () => {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT || 587);
  const secure =
    process.env.BREVO_SMTP_SECURE !== undefined
      ? process.env.BREVO_SMTP_SECURE === 'true'
      : port === 465;

  return {
    host,
    port,
    secure,
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  };
};

const isOrderEmailConfigured = () => {
  const { host, user, pass } = getOrderMailConfig();
  return Boolean(host && user && pass);
};

const getBrevoTransporter = () => {
  if (transporter) return transporter;

  const { host, port, secure, user, pass } = getOrderMailConfig();

  if (!host || !user || !pass) {
    throw new Error('Brevo SMTP is not configured');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
};

module.exports = {
  getOrderMailConfig,
  isOrderEmailConfigured,
  getBrevoTransporter,
};

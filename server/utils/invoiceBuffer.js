const { Writable } = require('stream');
const generateInvoice = require('./generateInvoice');

// Renders an order invoice into a PDF Buffer by reusing the existing
// generateInvoice(order, res) utility WITHOUT modifying it.
//
// generateInvoice writes to its second argument as if it were an Express
// response: it calls res.setHeader(...) and doc.pipe(res). We pass a minimal
// Writable stream and neutralize setHeader, then collect the PDF bytes.

const DEFAULT_TIMEOUT_MS = 20000;

const renderInvoiceToBuffer = (order, options = {}) => {
  const timeoutMs =
    typeof options.timeoutMs === 'number'
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    let timer;

    const collector = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      },
    });

    // generateInvoice sets HTTP headers on its response argument.
    collector.setHeader = () => {};

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);

      if (err) {
        reject(err);
        return;
      }

      const buffer = Buffer.concat(chunks);

      if (!buffer.length) {
        reject(new Error('Invoice generation produced an empty buffer'));
        return;
      }

      // PDF files must begin with the "%PDF-" signature.
      if (buffer.slice(0, 5).toString('latin1') !== '%PDF-') {
        reject(new Error('Generated invoice is not a valid PDF'));
        return;
      }

      resolve(buffer);
    };

    collector.on('finish', () => finish());
    collector.on('error', (error) => finish(error));

    timer = setTimeout(
      () => finish(new Error('Invoice generation timed out')),
      timeoutMs
    );

    Promise.resolve()
      .then(() => generateInvoice(order, collector))
      .catch((error) => finish(error));
  });
};

module.exports = renderInvoiceToBuffer;

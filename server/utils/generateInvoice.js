const PDFDocument = require('pdfkit');
const path = require('path');

const COMPANY = {
  name: 'STYLE4U',
  address: '1B/183, NIT, FARIDABAD, Faridabad-121001, Haryana',
  gstin: '06APTPG9748M1ZX',
  pan: 'APTPG9748M',
  phone: '+91 8076422987',
  email: 'style4ufbd@gmail.com',
  bank: {
    name: 'Indian Overseas Bank',
    accountHolder: 'Style4u',
    accountNumber: '019202000005389',
    ifsc: 'IOBA0000192',
    branch: 'Faridabad',
  },
};

// ─── layout constants ────────────────────────────────────────────────
const ML = 40;          // margin left
const MR = 40;          // margin right
const MT = 30;          // margin top
const ROW_H = 22;       // default table row height
const MIN_ROW_H = 18;   // compact row height for many items

// Column X positions for product table
const COL = {
  sr:     ML + 5,
  desc:   ML + 30,
  hsn:    ML + 250,
  tax:    ML + 305,
  qty:    ML + 355,
  price:  ML + 400,
  amount: ML + 455,
};

const generateInvoice = async (order, res) => {
  console.log('Invoice generation started');

  const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });

  const fileName = `Invoice-${order.orderId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  doc.pipe(res);

  const PW = doc.page.width;   // 595.28
  const PH = doc.page.height;  // 841.89

  // ── helpers ──────────────────────────────────────────────────────────

  const box = (x, y, w, h) => doc.rect(x, y, w, h).stroke();

  const hline = (x1, y, x2) => doc.moveTo(x1, y).lineTo(x2, y).stroke();

  const vline = (x, y1, y2) => doc.moveTo(x, y1).lineTo(x, y2).stroke();

  const txt = (text, x, y, opts = {}) => {
    doc
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(opts.size || 9)
      .fillColor(opts.color || 'black')
      .text(String(text ?? ''), x, y, {
        width:    opts.width  || undefined,
        align:    opts.align  || 'left',
        lineBreak: opts.lineBreak !== undefined ? opts.lineBreak : false,
      });
  };

  // measure text height for a given string + width
  const textHeight = (str, width, size = 9) => {
    doc.fontSize(size).font('Helvetica');
    return doc.heightOfString(String(str ?? ''), { width, lineBreak: true });
  };

  // ── SECTION HEIGHTS (fixed) ──────────────────────────────────────────
  const H_HEADER  = 45;   // "PERFORMA INVOICE" bar
  const H_COMPANY = 115;  // company details block
  const H_CUSTORD = 110;  // customer + order details
  const H_BILLSHIP= 110;  // billing + shipping
  const H_TBLHEAD = 30;   // table column headers
  const H_SUMMARY = 110;  // basic/rebate/gst/final
  const H_BANK    = 95;   // bank details
  const H_AMTWORD = 40;   // amount in words
  const H_FOOTER  = 60;   // footer / signatory

  // total fixed overhead (everything except product rows)
  const FIXED_HEIGHT =
    H_HEADER + H_COMPANY + H_CUSTORD + H_BILLSHIP +
    H_TBLHEAD + H_SUMMARY + H_BANK + H_AMTWORD + H_FOOTER + MT;

  // available height for product rows
  const AVAIL_ROW_AREA = PH - FIXED_HEIGHT - 20; // 20px buffer

  // ── compute row heights ──────────────────────────────────────────────
  const descColW = COL.hsn - COL.desc - 10;

  const rowHeights = order.items.map(item => {
    // description may wrap: "Name\nSize X\nQty Y"
    const descStr = `${item.name}\nSize ${item.size || '-'}\nQty ${item.quantity}`;
    const dh = textHeight(descStr, descColW, 9);
    return Math.max(MIN_ROW_H, dh + 8);
  });

  const totalRowH = rowHeights.reduce((s, h) => s + h, 0);

  // If everything fits on one page, keep as-is; otherwise compress rows
  let finalRowHeights = rowHeights;
  

  // ── decide font sizes based on item count ────────────────────────────
  const itemCount = order.items.length;
  const rowFontSize = itemCount > 15 ? 7 : itemCount > 10 ? 8 : 9;

  // ── Y tracker ────────────────────────────────────────────────────────
  let y = MT;

  // ════════════════════════════════════════════════════════════════════
  // 1. HEADER — "PERFORMA INVOICE"
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_HEADER);
  txt('PERFORMA INVOICE', 0, y + 14, { bold: true, size: 16, width: PW, align: 'center' });
  y += H_HEADER;

  // ════════════════════════════════════════════════════════════════════
  // 2. COMPANY DETAILS
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_COMPANY);

  try {
    const logoPath = path.join(__dirname, '../Public/logo.png');
    doc.image(logoPath, ML + 5, y + 8, { width: 70 });
  } catch (err) {
    console.error('LOGO ERROR:', err.message);
  }

  const cx = ML + 130; // company text start x
  txt(COMPANY.name,    cx, y + 10, { bold: true, size: 16 });
  txt(COMPANY.address, cx, y + 30, { size: 9, width: 220, lineBreak: true });
  txt(`Phone: ${COMPANY.phone}`,  cx, y + 60, { size: 9 });
  txt(`Email: ${COMPANY.email}`,  cx, y + 73, { size: 9 });

  const rx = PW - MR - 175;
  txt(`PAN No.: ${COMPANY.pan}`,   rx, y + 60, { size: 9 });
  txt(`GSTIN: ${COMPANY.gstin}`,   rx, y + 73, { size: 9 });

  y += H_COMPANY;

  // ════════════════════════════════════════════════════════════════════
  // 3. CUSTOMER + ORDER DETAILS
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_CUSTORD);
  vline(PW / 2, y, y + H_CUSTORD);

  const custY = y;
  txt('Customer Details', ML + 10, custY + 10, { bold: true, size: 10 });
  txt(`Contact Person: ${order.user?.name || ''}`,  ML + 10, custY + 28, { size: 9 });
  txt(`Dealer Name: ${order.user?.name || ''}`,     ML + 10, custY + 41, { size: 9 });
  txt(`Contact No.: ${order.user?.phone || ''}`,    ML + 10, custY + 54, { size: 9 });
  txt(`Email: ${order.user?.email || ''}`,          ML + 10, custY + 67, { size: 9 });

  const ordX = PW / 2 + 10;
  txt('Order Details', ordX, custY + 10, { bold: true, size: 10 });
  txt(`Order No.: ${order.orderId}`,                        ordX, custY + 28, { size: 9 });
  txt(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, ordX, custY + 41, { size: 9 });
  txt(`Payment Date: ${new Date(order.paymentDate || order.createdAt).toLocaleDateString('en-IN')}`, ordX, custY + 67, { size: 9 });
  txt(`Payment Terms: ${order.paymentTerms || '100% Advance'}`, ordX, custY + 80, { size: 9 });

  y += H_CUSTORD;

  // ════════════════════════════════════════════════════════════════════
  // 4. BILLING + SHIPPING
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_BILLSHIP);
  vline(PW / 2, y, y + H_BILLSHIP);

  const billY = y;
  txt('Billing To', ML + 10, billY + 10, { bold: true, size: 10 });
  txt(`Address: ${order.billingAddress?.street || order.shippingAddress?.street || ''}`, ML + 10, billY + 28, { size: 9, width: 220 });
  txt(`City: ${order.billingAddress?.city    || order.shippingAddress?.city    || ''}`, ML + 10, billY + 41, { size: 9 });
  txt(`State: ${order.billingAddress?.state  || order.shippingAddress?.state  || ''}`, ML + 10, billY + 54, { size: 9 });
  txt(`Pin: ${order.billingAddress?.pin      || order.shippingAddress?.pin     || ''}`, ML + 10, billY + 67, { size: 9 });
  txt(`Country: ${order.billingAddress?.country || 'India'}`,                           ML + 10, billY + 80, { size: 9 });

  const shipX = PW / 2 + 10;
  txt('Shipping To', shipX, billY + 10, { bold: true, size: 10 });
  txt(`Address: ${order.shippingAddress?.street || ''}`, shipX, billY + 28, { size: 9, width: 220 });
  txt(`City: ${order.shippingAddress?.city    || ''}`,   shipX, billY + 41, { size: 9 });
  txt(`State: ${order.shippingAddress?.state  || ''}`,   shipX, billY + 54, { size: 9 });
  txt(`Pin: ${order.shippingAddress?.pin      || ''}`,   shipX, billY + 67, { size: 9 });
  txt(`Country: ${order.shippingAddress?.country || 'India'}`, shipX, billY + 80, { size: 9 });

  y += H_BILLSHIP;

  // ════════════════════════════════════════════════════════════════════
  // 5. PRODUCT TABLE HEADER
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_TBLHEAD);

  // vertical dividers for table header
  [COL.desc, COL.hsn, COL.tax, COL.qty, COL.price, COL.amount].forEach(cx => {
    vline(cx - 5, y, y + H_TBLHEAD);
  });

  const thY = y + 10;
  doc.font('Helvetica-Bold').fontSize(9);
  txt('Sr No.',      COL.sr,     thY, { bold: true, size: 9 });
  txt('Description', COL.desc,   thY, { bold: true, size: 9 });
  txt('HSN',         COL.hsn,    thY, { bold: true, size: 9 });
  txt('Tax (%)',     COL.tax,    thY, { bold: true, size: 9 });
  txt('Quantity',    COL.qty,    thY, { bold: true, size: 9 });
  txt('Price',       COL.price,  thY, { bold: true, size: 9 });
  txt('Amount',      COL.amount, thY, { bold: true, size: 9 });

  y += H_TBLHEAD;

  // ════════════════════════════════════════════════════════════════════
  // 6. PRODUCT ROWS
  // ════════════════════════════════════════════════════════════════════
  const tableStartY = y;
  const tableEndX   = PW - MR;
  let totalQty = 0;

  order.items.forEach((item, idx) => {
  const rh = finalRowHeights[idx];

  // ── check if new page needed ──
  if (y + rh > PH - H_SUMMARY - H_FOOTER - 20) {
    // close left/right borders of current table body
    vline(ML,        tableStartY, y);
    vline(tableEndX, tableStartY, y);

    // new page
    doc.addPage()
    y = MT

    // redraw table header on new page
    box(ML, y, PW - ML - MR, H_TBLHEAD);
    [COL.desc, COL.hsn, COL.tax, COL.qty, COL.price, COL.amount].forEach(cx => {
      vline(cx - 5, y, y + H_TBLHEAD);
    });
    txt('Sr No.',      COL.sr,     y + 10, { bold: true, size: 9 });
    txt('Description', COL.desc,   y + 10, { bold: true, size: 9 });
    txt('HSN',         COL.hsn,    y + 10, { bold: true, size: 9 });
    txt('Tax (%)',     COL.tax,    y + 10, { bold: true, size: 9 });
    txt('Quantity',    COL.qty,    y + 10, { bold: true, size: 9 });
    txt('Price',       COL.price,  y + 10, { bold: true, size: 9 });
    txt('Amount',      COL.amount, y + 10, { bold: true, size: 9 });
    y += H_TBLHEAD
  }

  const ry = y;

  // row bottom border
  hline(ML, ry + rh, tableEndX);

  // vertical dividers
  [COL.desc, COL.hsn, COL.tax, COL.qty, COL.price, COL.amount].forEach(cx => {
    vline(cx - 5, ry, ry + rh);
  });

  const midY = ry + Math.max(4, (rh - rowFontSize) / 2);

  doc.font('Helvetica').fontSize(rowFontSize);

  txt(idx + 1, COL.sr, midY, { size: rowFontSize });

  const descText = `${item.name}`;
  txt(descText, COL.desc, ry + 4, { size: rowFontSize, width: descColW, lineBreak: true });
  if (item.size) {
    const nameH = textHeight(descText, descColW, rowFontSize);
    txt(`Size  ${item.size}`,     COL.desc, ry + 4 + nameH,      { size: rowFontSize });
    txt(`Qty   ${item.quantity}`, COL.desc, ry + 4 + nameH + 11, { size: rowFontSize });
  }

  txt(item.hsnCode || '-',                              COL.hsn,    midY, { size: rowFontSize });
  txt(`${order.gstPercent}%`,                           COL.tax,    midY, { size: rowFontSize });
  txt(item.quantity,                                    COL.qty,    midY, { size: rowFontSize });
  txt(`Rs. ${item.price}`,                            COL.price,  midY, { size: rowFontSize });
  txt(`Rs. ${(item.price * item.quantity).toFixed(2)}`, COL.amount, midY, { size: rowFontSize });

  totalQty += Number(item.quantity);
  y += rh;
});

  // left + right borders of table body
  vline(ML,        tableStartY, y);
  vline(tableEndX, tableStartY, y);

  // ════════════════════════════════════════════════════════════════════
  // 7. THANKS + BANK DETAILS  |  SUMMARY (two-column row)
  // ════════════════════════════════════════════════════════════════════
  const summaryRowH = H_SUMMARY;
  box(ML, y, PW - ML - MR, summaryRowH);
  vline(PW / 2 + 20, y, y + summaryRowH);

  // left: thanks + bank
  const leftY = y;
  txt('Thanks for your business', ML + 10, leftY + 10, { bold: true, size: 9 });

  txt('Bank Details', ML + 10, leftY + 28, { bold: true, size: 9 });
  txt(`Company Name: ${COMPANY.name}`,                          ML + 10, leftY + 42, { size: 8 });
  txt(`Bank Name: ${COMPANY.bank.name}`,                        ML + 10, leftY + 54, { size: 8 });
  txt(`Account No.: ${COMPANY.bank.accountNumber}`,             ML + 10, leftY + 66, { size: 8 });
  txt(`Branch: ${COMPANY.bank.branch}`,                         ML + 10, leftY + 78, { size: 8 });
  txt(`IFSC Code: ${COMPANY.bank.ifsc}`,                        ML + 160, leftY + 54, { size: 8 });

  // right: summary figures
  const sumX = PW / 2 + 30;
  const labX = sumX;
  const valX = PW - MR - 70;

  txt(`Total Quantity`,                              labX,         leftY + 10, { size: 9 });
  txt(totalQty,                                      valX,         leftY + 10, { size: 9 });

  txt(`Basic Amount`,                                labX,         leftY + 24, { size: 9 });
  txt(`Rs. ${order.basicAmount.toFixed(2)}`,       valX,         leftY + 24, { size: 9 });

  if (order.rebatePercent) {
    txt(`Rebate (${order.rebatePercent}%)`,           labX,         leftY + 38, { size: 9 });
    txt(`-Rs. ${order.rebateAmount.toFixed(2)}`,    valX,         leftY + 38, { size: 9 });
  }

  txt(`${order.gstType || 'IGST'}(${order.gstPercent}%)`, labX,   leftY + 52, { size: 9 });
  txt(`Rs. ${order.gstAmount.toFixed(2)}`,          valX,         leftY + 52, { size: 9 });

  txt(`Courier Charges`,                             labX,          leftY + 66, { size: 9 });
  txt(`Rs. ${(order.courierCharges || 0).toFixed(2)}`, valX,     leftY + 66, { size: 9 });

  // txt(`Tax on courier charges`,                      labX,          leftY + 80, { size: 9 });
  // txt(`Rs. ${(order.courierTax || 0).toFixed(2)}`, valX,          leftY + 80, { size: 9 });

  // horizontal divider above total
  hline(PW / 2 + 20, leftY + 93, PW - MR);

  txt('Total',                                       labX,          leftY + 97, { bold: true, size: 10 });
  txt(`Rs. ${order.finalAmount.toFixed(2)}`,       valX,          leftY + 97, { bold: true, size: 10 });

  y += summaryRowH;

  // ════════════════════════════════════════════════════════════════════
  // 8. ORDER STATUS + NOTES + SIGNATORY
  // ════════════════════════════════════════════════════════════════════
  box(ML, y, PW - ML - MR, H_FOOTER);

  txt(`Order Status : `, ML + 10, y + 12, { bold: true, size: 9 });
  txt(order.paymentStatus?.toUpperCase() || '', ML + 85, y + 12, { size: 9 });

  txt('Please Note: -', ML + 10, y + 26, { size: 8 });
  txt('Kindly share NEFT/RTGS details to  style4ufbd@gmail.com', ML + 10, y + 38, { size: 8 });
  txt(COMPANY.phone, ML + 10, y + 50, { size: 8 });

  txt('For STYLE4U',        PW - MR - 100, y + 12, { bold: true, size: 9 });
  txt('Authorised Signatory', PW - MR - 110, y + 46, { size: 8 });

  y += H_FOOTER;

  console.log('Invoice generation completed, final y:', y.toFixed(1), '/ page height:', PH.toFixed(1));
  doc.end();
};

module.exports = generateInvoice;
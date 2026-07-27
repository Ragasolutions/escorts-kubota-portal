const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Settings = require('../models/Settings');
const generateInvoice = require('../utils/generateInvoice');
const ExcelJS = require("exceljs");
// ─── @desc    Place a new order ─────────────────────────────
// ─── @route   POST /api/orders ──────────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    // 1. Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // 2. Fetch all products in the order at once
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    // 3. Build order items with snapshotted data
    // We snapshot name, price, image at order time
    // So even if product changes later, order history stays accurate
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found or inactive`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,           // snapshot
        price: product.price,         // snapshot
        image: product.images[0]?.url || '', // snapshot first image
        size: item.size || '',
        quantity: item.quantity,
        hsnCode: product.hsnCode || '',
      });

      totalAmount += product.price * item.quantity;
    }

const user = await User.findById(req.user.id);

const settings = await Settings.findOne();

const rebatePercent =
  settings?.rebatePercent || 0;

const basicAmount = totalAmount;

const rebateAmount =
  (basicAmount * rebatePercent) / 100;

let gstType = 'IGST';

if (
  user?.state?.trim().toLowerCase() ===
  'haryana'
) {
  gstType = 'CGST_SGST';
}

const gstPercent = 5;

const gstAmount =
  (basicAmount * gstPercent) / 100;

const finalAmount =
  (basicAmount - rebateAmount) +
  gstAmount;

    // 4. Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,


  basicAmount,
  rebatePercent,
  rebateAmount,

  gstType,
  gstPercent,
  gstAmount,

  finalAmount,

    });

    // 5. Deduct stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ success: true, order });

  } catch (error) {
    next(error);
  }
};



exports.calculateOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'No items provided',
      });
    }

    const productIds = items.map((i) => i.product);

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    let basicAmount = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.product
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      basicAmount +=
        product.price * item.quantity;
    }

    const settings =
      await Settings.findOne();

    const rebatePercent =
      settings?.rebatePercent || 0;

    const rebateAmount =
      (basicAmount * rebatePercent) / 100;

    const user =
      await User.findById(req.user.id);

    let gstType = 'IGST';

    if (
      user?.state?.trim().toLowerCase() ===
      'haryana'
    ) {
      gstType = 'CGST_SGST';
    }

    const gstPercent = 5;

    const gstAmount =
      (basicAmount * gstPercent) / 100;

    const finalAmount =
      basicAmount -
      rebateAmount +
      gstAmount;

    res.status(200).json({
      success: true,

      basicAmount,

      rebatePercent,
      rebateAmount,

      gstType,
      gstPercent,
      gstAmount,

      finalAmount,
    });

  } catch (error) {
    next(error);
  }
};

exports.downloadInvoice = async (
  req,
  res,
  next
) => {
  try {

    const order = await Order.findById(
      req.params.id
    ).populate(
      'user',
      'name dealershipName phone email address city state code'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await generateInvoice(
      order,
      res
    );

  } catch (error) {
    next(error);
  }
};


// ─── @desc    Get logged-in user's orders ───────────────────
// ─── @route   GET /api/orders/my ────────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single order by ID ────────────────────────
// ─── @route   GET /api/orders/:id ───────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name phone code');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Dealers can only see their own orders
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all orders (admin) ────────────────────────
// ─── @route   GET /api/orders ───────────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name phone code role')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update order status ───────────────────────────
// ─── @route   PUT /api/orders/:id/status ────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

const validStatuses = ['Order Received', 'In Process', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Can only cancel from pending
if (status === 'Cancelled' && order.status !== 'Order Received') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled',
      });
    }

    // Update status + push to history
    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || '',
    });

    await order.save();

    res.status(200).json({ success: true, order });

  } catch (error) {
    next(error);
  }
};


exports.createAdminOrder = async (
  req,
  res,
  next
) => {
  try {
    const { dealerId, items } = req.body;

    if (!dealerId) {
      return res.status(400).json({
        success: false,
        message: 'Dealer is required',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product',
      });
    }

    // Dealer
    const dealer = await User.findById(dealerId);

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found',
      });
    }

    // Products
    const productIds = items.map(i => i.product);

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        p => p._id.toString() === item.product
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        size: item.size || '',
        quantity: item.quantity,
        price: product.price,
        hsnCode: product.hsnCode || '',
      });

      totalAmount += product.price * item.quantity;
    }

    // Pricing
    const settings = await Settings.findOne();

    const rebatePercent =
      settings?.rebatePercent || 0;

    const basicAmount = totalAmount;

    const rebateAmount =
      (basicAmount * rebatePercent) / 100;

    let gstType = 'IGST';

    if (
      dealer?.state?.trim().toLowerCase() ===
      'haryana'
    ) {
      gstType = 'CGST_SGST';
    }

    const gstPercent = 5;

    const gstAmount =
      (basicAmount * gstPercent) / 100;

    const finalAmount =
      basicAmount -
      rebateAmount +
      gstAmount;

    // Shipping Address
    const shippingAddress = {
      name: dealer.name,
      phone: dealer.phone,
      street: dealer.address || '',
      city: dealer.city || '',
      state: dealer.state || '',
      pincode: dealer.pincode || '',
    };

    // Create Order
    const order = await Order.create({
      user: dealer._id,

      items: orderItems,

      totalAmount,

      shippingAddress,

      basicAmount,
      rebatePercent,
      rebateAmount,

      gstType,
      gstPercent,
      gstAmount,

      finalAmount,

      paymentStatus: 'paid',
      paymentMethod: 'Sponsored',

      statusHistory: [
        {
          status: 'Order Received',
          note: 'Sponsored order created by Admin',
        },
      ],
    });

    // Reduce Stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });

  } catch (error) {
    next(error);
  }
};


exports.exportOrders = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Freeze Header
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 18 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Dealer Code", key: "dealerCode", width: 15 },
      { header: "Dealer Name", key: "dealerName", width: 25 },
      { header: "Dealer Email", key: "dealerEmail", width: 30 },
      { header: "Dealer Phone", key: "dealerPhone", width: 18 },
      { header: "State", key: "state", width: 18 },
      { header: "Sponsored", key: "sponsored", width: 12 },
      { header: "Payment Method", key: "paymentMethod", width: 18 },
      { header: "Payment Status", key: "paymentStatus", width: 18 },
      { header: "Order Status", key: "status", width: 18 },
      { header: "Product Name", key: "productName", width: 30 },
      { header: "HSN Code", key: "hsnCode", width: 15 },
      { header: "Size", key: "size", width: 12 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit Price", key: "unitPrice", width: 15 },
      { header: "Basic Amount", key: "basicAmount", width: 15 },
      { header: "Rebate", key: "rebate", width: 15 },
      { header: "GST", key: "gst", width: 15 },
      { header: "Final Amount", key: "finalAmount", width: 15 },
    ];

    const orders = await Order.find()
      .populate("user", "name code email phone")
      .sort({ createdAt: -1 });

    for (const order of orders) {
      for (const item of order.items) {
        worksheet.addRow({
          orderId: order.orderId,

          orderDate: new Date(
            order.createdAt
          ).toLocaleDateString("en-IN"),

          dealerCode: order.user?.code || "",

          dealerName: order.user?.name || "",

          dealerEmail: order.user?.email || "",

          dealerPhone: order.user?.phone || "",

          state:
            order.shippingAddress?.state || "",

          sponsored:
            order.paymentMethod === "Sponsored"
              ? "Yes"
              : "No",

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          status: order.status,

          productName: item.name,

          hsnCode: item.hsnCode || "",

          size: item.size || "-",

          quantity: item.quantity,

          unitPrice: item.price,

          basicAmount:
            order.basicAmount,

          rebate:
            order.rebateAmount,

          gst:
            order.gstAmount,

          finalAmount:
            order.finalAmount,
        });
      }
    }

    // Header Style
    const headerRow = worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF16A34A",
      },
    };

    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Enable Filters
    worksheet.autoFilter = {
      from: "A1",
      to: "T1",
    };

    // Currency Format
    ["P", "Q", "R", "S", "T"].forEach((column) => {
      worksheet.getColumn(column).numFmt =
        "₹#,##0.00";
    });

    // Download Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Orders-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to export orders",
    });
  }
};
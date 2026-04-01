const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

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
      });

      totalAmount += product.price * item.quantity;
    }

    // 4. Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
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
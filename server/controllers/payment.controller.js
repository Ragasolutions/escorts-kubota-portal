const razorpay = require('../config/razorpay')
const Order = require('../models/Order.model')
const crypto = require('crypto')

// ─── Create Razorpay Order ────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const razorpayOrder = await razorpay.orders.create({
  amount: Math.round(order.finalAmount * 100),
  currency: 'INR',
  receipt: order.orderId,
  notes: {
    orderId: order._id.toString(),
    userId: req.user.id,
  }
})

    // Save razorpay order id
    order.razorpayOrderId = razorpayOrder.id
    await order.save()

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error) {
    next(error)
  }
}

// ─── Verify Payment ───────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    // Update order
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    order.paymentStatus = 'paid'
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.status = 'Order Received'
    order.statusHistory.push({
      status: 'Order Received',
      changedAt: new Date(),
      note: `Payment received — ${razorpayPaymentId}`,
    })

    await order.save()

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order,
    })

  } catch (error) {
    next(error)
  }
}

// Create Razorpay order WITHOUT saving to DB
exports.createTempOrder = async (req, res, next) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' })
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `temp_${Date.now()}`,
    })

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    })

  } catch (error) {
    next(error)
  }
}
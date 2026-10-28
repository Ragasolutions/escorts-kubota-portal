const razorpay = require('../config/razorpay')
const Order = require('../models/Order.model')
const crypto = require('crypto')
const orderEmailService = require('../services/orderEmail.service')

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
  const verifyStartTime = Date.now();
  const correlationId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const orderIdRedacted = req.body?.orderId ? String(req.body.orderId).slice(-6) : 'unknown';

  console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:payment_verify_start] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Payment verification started`);

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

    // Verify signature
    const sigStartTime = Date.now();
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      const sigDuration = Date.now() - sigStartTime;
      console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:signature_verify_failure] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Signature verification failed (duration: ${sigDuration}ms)`);
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:payment_verify_finish] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Payment verification completed (status: 400, totalDuration: ${Date.now() - verifyStartTime}ms)`);
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    const sigDuration = Date.now() - sigStartTime;
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:signature_verify_success] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Signature verified successfully (duration: ${sigDuration}ms)`);

    // Update order
    const lookupStartTime = Date.now();
    const order = await Order.findById(orderId)
    const lookupDuration = Date.now() - lookupStartTime;

    if (!order) {
      console.warn(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:order_lookup_failure] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Order lookup failed: not found (duration: ${lookupDuration}ms)`);
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:payment_verify_finish] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Payment verification completed (status: 404, totalDuration: ${Date.now() - verifyStartTime}ms)`);
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:order_lookup_success] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Order lookup succeeded (duration: ${lookupDuration}ms)`);

    order.paymentStatus = 'paid'
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.status = 'Order Received'
    order.statusHistory.push({
      status: 'Order Received',
      changedAt: new Date(),
      note: `Payment received — ${razorpayPaymentId}`,
    })

    const saveStartTime = Date.now();
    await order.save()
    const saveDuration = Date.now() - saveStartTime;
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:order_save_success] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Order payment status persisted as paid (duration: ${saveDuration}ms)`);

    // Best-effort order confirmation email (never affects the API result).
    const emailDispatchStart = Date.now();
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_dispatch_start] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Initiating order confirmation email dispatch`);

    try {
      const emailResult = await orderEmailService.sendOrderConfirmation(order, { correlationId })
      const emailDispatchDuration = Date.now() - emailDispatchStart;
      console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_dispatch_finish] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Email dispatch returned (duration: ${emailDispatchDuration}ms, sent: ${Boolean(emailResult?.sent)}, skipped: ${Boolean(emailResult?.skipped)})`);
    } catch (emailError) {
      const emailDispatchDuration = Date.now() - emailDispatchStart;
      console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:email_dispatch_error] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Order confirmation email error (duration: ${emailDispatchDuration}ms): ${emailError.message}`)
    }

    const totalVerifyDuration = Date.now() - verifyStartTime;
    console.log(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:payment_verify_finish] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Payment verification completed (status: 200, totalDuration: ${totalVerifyDuration}ms)`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order,
    })

  } catch (error) {
    const totalVerifyDuration = Date.now() - verifyStartTime;
    console.error(`[ORDER_EMAIL_DIAG] [${new Date().toISOString()}] [stage:payment_verify_error] [corrId:${correlationId}] [orderId:***${orderIdRedacted}] Payment verification unhandled error (status: 500, duration: ${totalVerifyDuration}ms): ${error.message}`);
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
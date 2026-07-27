const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  calculateOrder,
  downloadInvoice,
    createAdminOrder,
      exportOrders,
} = require('../controllers/order.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// Dealer / Employee
router.post('/calculate', protect, calculateOrder);

router.post('/', protect, placeOrder);

router.get('/my', protect, getMyOrders);

// Admin
router.get('/export', protect, adminOnly, exportOrders);

router.get('/', protect, adminOnly, getAllOrders);

router.put('/:id/status', protect, adminOnly, updateOrderStatus);

router.post(
  '/admin/create',
  protect,
  adminOnly,
  createAdminOrder
);

// Invoice
router.get('/:id/invoice', protect, downloadInvoice);

// Single Order (KEEP THIS LAST)
router.get('/:id', protect, getOrderById);
module.exports = router;
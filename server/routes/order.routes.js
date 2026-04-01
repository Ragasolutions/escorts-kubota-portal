const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// Dealer / Employee
router.post('/',      protect, placeOrder);
router.get('/my',     protect, getMyOrders);
router.get('/:id',    protect, getOrderById);

// Admin only
router.get('/',                     protect, adminOnly, getAllOrders);
router.put('/:id/status',           protect, adminOnly, updateOrderStatus);

module.exports = router;
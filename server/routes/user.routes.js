const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} = require('../controllers/user.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes are admin only
router.get('/',      protect, adminOnly, getAllUsers);
router.get('/:id',   protect, adminOnly, getUserById);
router.post('/',     protect, adminOnly, createUser);
router.put('/:id',   protect, adminOnly, updateUser);
router.patch('/:id/toggle-status', protect, adminOnly, toggleUserStatus);

module.exports = router;
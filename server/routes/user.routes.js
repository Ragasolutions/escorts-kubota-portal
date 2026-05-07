const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  bulkUploadUsers,
    deleteUser,
      bulkDeleteUsers,
} = require('../controllers/user.controller');
const { uploadSingle , uploadExcelFile  } = require('../middleware/upload.middleware')

const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes are admin only
router.get('/',      protect, adminOnly, getAllUsers);
router.get('/:id',   protect, adminOnly, getUserById);
router.post('/',     protect, adminOnly, createUser);
router.put('/:id',   protect, adminOnly, updateUser);
router.patch('/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.delete('/bulk-delete', protect, adminOnly, bulkDeleteUsers)
router.delete('/:id', protect, adminOnly, deleteUser);
router.post('/bulk-upload', protect, adminOnly, uploadExcelFile, bulkUploadUsers)


module.exports = router;
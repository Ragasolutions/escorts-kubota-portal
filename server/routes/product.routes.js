const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  deleteImage,
} = require('../controllers/product.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

// Public (any authenticated user)
router.get('/',    protect, getProducts);
router.get('/:id', protect, getProduct);

// Admin only
router.post('/',    protect, adminOnly, createProduct);
router.put('/:id',  protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Image management
router.post('/:id/images',           protect, adminOnly, uploadMultiple, uploadImages);
router.delete('/:id/images/:imgId',  protect, adminOnly, deleteImage);

module.exports = router;
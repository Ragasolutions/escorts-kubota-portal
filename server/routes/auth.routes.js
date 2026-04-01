const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to registered phone number
// @access  Public
router.post('/send-otp', sendOtp);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return JWT
// @access  Public
router.post('/verify-otp', verifyOtp);

// @route   GET /api/auth/me
// @desc    Get logged-in user's profile
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
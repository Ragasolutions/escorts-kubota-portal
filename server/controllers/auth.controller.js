const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ─── helpers ────────────────────────────────────────────────

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── @desc    Send OTP ───────────────────────────────────────
// ─── @route   POST /api/auth/send-otp ───────────────────────
// ─── @access  Public ────────────────────────────────────────

exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // 1. Check user exists and is active
    const user = await User.findOne({ phone, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No active account found with this phone number' });
    }

    // 2. Invalidate any previous unused OTPs for this phone
    await OTP.updateMany(
      { phone, isUsed: false },
      { isUsed: true }
    );

    // 3. Generate and save new OTP
    const otp = generateOtp();
    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // 4. Send OTP via SMS (Twilio plugs in here later)
    // For now: log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production:
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Verify OTP and issue JWT ──────────────────────
// ─── @route   POST /api/auth/verify-otp ─────────────────────
// ─── @access  Public ────────────────────────────────────────

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    // DEMO MODE — accept '123456' as master OTP
    if (otp !== '123456') {
      const otpRecord = await OTP.findOne({
        phone,
        otp,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      otpRecord.isUsed = true;
      await otpRecord.save();
    }

    // Fetch user
    const user = await User.findOne({ phone, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or deactivated' });
    }

    // Sign JWT
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        code: user.code,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get current logged-in user ────────────────────
// ─── @route   GET /api/auth/me ──────────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    const user = await User.findById(req.user.id).select('-__v');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
const User = require('../models/User.model')
const OTP = require('../models/OTP.model')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const admin = require('../config/firebase')

// ─── helpers ─────────────────────────────────────────────────

const generateOtp = () => crypto.randomInt(100000, 999999).toString()

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const sendSmsViaFirebase = async (phone, otp) => {
  // Firebase Admin SDK doesn't send SMS directly
  // It verifies tokens — SMS is sent from frontend
  // For server-side OTP we use a custom approach
  console.log(`OTP for ${phone}: ${otp}`)
}

// ─── @desc    Send OTP ────────────────────────────────────────
// ─── @route   POST /api/auth/send-otp ────────────────────────
// ─── @access  Public ─────────────────────────────────────────

exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' })
    }

    const user = await User.findOne({ phone, isActive: true })
    if (!user) {
      return res.status(404).json({ success: false, message: 'No active account found with this phone number' })
    }

    // Invalidate old OTPs
    await OTP.updateMany({ phone, isUsed: false }, { isUsed: true })

    // Generate OTP
    const otp = generateOtp()
    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otp}`)
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    })

  } catch (error) {
    next(error)
  }
}

// ─── @desc    Verify Firebase Token OR demo OTP ───────────────
// ─── @route   POST /api/auth/verify-otp ──────────────────────
// ─── @access  Public ─────────────────────────────────────────

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, firebaseToken } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone is required' })
    }

    // ── Method 1: Firebase Token (production) ──
    if (firebaseToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(firebaseToken)

        // Firebase phone format: +91XXXXXXXXXX
        const firebasePhone = decoded.phone_number?.replace('+91', '').replace(/\D/g, '')
        const inputPhone = phone.replace(/\D/g, '').slice(-10)

        if (firebasePhone !== inputPhone) {
          return res.status(400).json({ success: false, message: 'Phone number mismatch' })
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid Firebase token' })
      }
    }

    // ── Method 2: Demo OTP (123456) ──
    else if (otp === '123456' && process.env.NODE_ENV === 'development') {
      // Allow demo OTP in dev mode
    }

    // ── Method 3: Real OTP from DB ──
    else if (otp) {
      const otpRecord = await OTP.findOne({
        phone,
        otp,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 })

      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
      }

      otpRecord.isUsed = true
      await otpRecord.save()
    } else {
      return res.status(400).json({ success: false, message: 'OTP or Firebase token required' })
    }

    // Fetch user
    const user = await User.findOne({ phone, isActive: true })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or deactivated' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = signToken(user._id)

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
    })

  } catch (error) {
    next(error)
  }
}

// ─── @desc    Get current user ────────────────────────────────
// ─── @route   GET /api/auth/me ────────────────────────────────
// ─── @access  Private ────────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v')
    res.status(200).json({ success: true, user })
  } catch (error) {
    next(error)
  }
}
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-__v');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired',
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access only',
    });
  }
  next();
};

exports.dealerOrEmployee = (req, res, next) => {
  if (!['dealer', 'employee', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }
  next();
};
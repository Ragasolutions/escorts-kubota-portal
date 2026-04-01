const User = require('../models/User.model');

// ─── @desc    Get all users ──────────────────────────────────
// ─── @route   GET /api/users ────────────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      role,
      search,
      isActive,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (role) filter.role = role;

    // isActive comes as string from query, convert to boolean
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { code:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-__v')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single user ────────────────────────────────
// ─── @route   GET /api/users/:id ────────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create a new user (dealer/employee) ───────────
// ─── @route   POST /api/users ───────────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.createUser = async (req, res, next) => {
  try {
    const { code, name, phone, email, role, address } = req.body;

    // 1. Required fields
    if (!code || !name || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Code, name, phone and role are required',
      });
    }

    // 2. Valid role check
    if (!['dealer', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be dealer, employee or admin',
      });
    }

    // 3. Check duplicates
    const existing = await User.findOne({ $or: [{ phone }, { code }] });
    if (existing) {
      const field = existing.phone === phone ? 'phone number' : 'dealer code';
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }

    // 4. Create user
    const user = await User.create({ code, name, phone, email, role, address });

    res.status(201).json({ success: true, user });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update user details ───────────────────────────
// ─── @route   PUT /api/users/:id ────────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.updateUser = async (req, res, next) => {
  try {
    // Don't allow role/code to be changed silently — be explicit
    const { name, phone, email, address } = req.body;

    const updates = {};
    if (name)    updates.name = name;
    if (phone)   updates.phone = phone;
    if (email)   updates.email = email;
    if (address) updates.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    next(error);
  }
};

// ─── @desc    Activate or deactivate a user ─────────────────
// ─── @route   PATCH /api/users/:id/toggle-status ────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive,
    });

  } catch (error) {
    next(error);
  }
};      
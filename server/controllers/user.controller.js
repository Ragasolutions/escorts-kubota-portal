const User = require('../models/User.model');
const XLSX = require('xlsx')

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


exports.bulkUploadUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' })
    }

    const uploadedCompany = req.body.company || ''

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' })
    }

    const results = { created: 0, updated: 0, skipped: 0, errors: [] }

const seenPhones = new Set()
const seenCodes = new Set()

    for (const row of rows) {
      try {
        const code = (
          row['Member No.'] || row['Member No'] ||
          row['Dealer Code'] || row['Code'] || row['CODE'] || ''
        ).toString().trim().toUpperCase()

        const name = (
          row['VIP Name'] || row['Name'] || row['NAME'] || ''
        ).toString().trim()

        const dealershipName = (
          row['Dealership Name'] || row['Dealership'] || row['DEALERSHIP NAME'] || ''
        ).toString().trim()

        const phone = (
          row['Mobile No.'] || row['Mobile No'] || row['Mobile'] ||
          row['Phone No.'] || row['Phone'] || row['MOBILE'] || row['phone'] || ''
        ).toString().trim().replace(/\D/g, '').slice(-10)

        const email = (
          row['Email-ID'] || row['Email'] || row['EMAIL'] || ''
        ).toString().trim().toLowerCase()

        const address = (
          row['Address'] || row['ADDRESS'] || ''
        ).toString().trim()

        const city = (
          row['City'] || row['CITY'] || row['city'] || ''
        ).toString().trim()

        const state = (
          row['State'] || row['STATE'] || row['state'] || ''
        ).toString().trim()

        const zone = (
          row['Zone'] || row['ZONE'] || row['zone'] || ''
        ).toString().trim()

        const region = (
          row['Region'] || row['REGION'] || row['region'] || ''
        ).toString().trim()


// Check duplicate within same file
if (phone && seenPhones.has(phone)) {
  results.skipped++
  results.errors.push(`⚠️ Duplicate in file: ${phone} — skipped`)
  continue
}
if (code && seenCodes.has(code)) {
  results.skipped++
  results.errors.push(`⚠️ Duplicate in file: ${code} — skipped`)
  continue
}

// Add to seen sets
if (phone) seenPhones.add(phone)
if (code) seenCodes.add(code)

        // Skip if missing required fields
        if (!code && !phone) {
          results.skipped++
          results.errors.push(`Row skipped — missing code and phone`)
          continue
        }

        if (!name && !dealershipName) {
          results.skipped++
          results.errors.push(`Row skipped — missing name: code ${code}`)
          continue
        }

        // Check if dealer exists by phone OR code
        const queryConditions = []
        if (phone) queryConditions.push({ phone })
        if (code) queryConditions.push({ code })

        const existing = queryConditions.length > 0
          ? await User.findOne({ $or: queryConditions })
          : null

        if (existing) {
          if (uploadedCompany) {
            if (!existing.companies?.includes(uploadedCompany)) {
              // Add new company to existing dealer
              await User.findByIdAndUpdate(existing._id, {
                $addToSet: { companies: uploadedCompany }
              })
              results.updated++
              results.errors.push(`ℹ️ ${existing.name} — added: ${uploadedCompany}`)
            } else {
              results.skipped++
              results.errors.push(`Already in ${uploadedCompany}: ${existing.name}`)
            }
          } else {
            results.skipped++
            results.errors.push(`Duplicate skipped: ${code} / ${phone}`)
          }
          continue
        }

        // Create new dealer
        await User.create({
          code: code || `AUTO-${Date.now()}`,
          name: name || dealershipName || 'Unknown',
          dealershipName: dealershipName || name || '',
          phone,
          email: email || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          zone: zone || undefined,
          region: region || undefined,
          role: 'dealer',
          isActive: true,
          companies: uploadedCompany ? [uploadedCompany] : [],
        })

        results.created++

      } catch (err) {
        results.skipped++
        results.errors.push(`Error: ${err.message}`)
      }
    }

    res.status(200).json({
      success: true,
      message: `Done — ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      results,
    })

  } catch (error) {
    next(error)
  }
}


exports.bulkDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body
    if (!ids || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No users selected' })
    }
    const result = await User.deleteMany({ _id: { $in: ids } })
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    next(error)
  }
}


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

const {
  code,
  name,
  phone,
  email,
  role,
  address,
  city,
  state,
} = req.body;

    // 1. Required fields
   if (
  !code ||
  !name ||
  !phone ||
  !role ||
  !address ||
  !city ||
  !state
) {
  return res.status(400).json({
    success: false,
    message:
      'Code, Name, Phone, Address, City, State and Role are required',
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
const {
  name,
  phone,
  email,
  address,
  city,
  state,
} = req.body;

    const updates = {};
    if (name)    updates.name = name;
    if (phone)   updates.phone = phone;
    if (email)   updates.email = email;
if (address) updates.address = address;
if (city) updates.city = city;
if (state) updates.state = state;

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


// ─── @desc    Delete user ───────────────────────────────
// ─── @route   DELETE /api/users/:id ─────────────────────
// ─── @access  Admin ─────────────────────────────────────

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ❌ Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    next(error);
  }
};


// ─── @desc    Search Dealers ───────────────────────────────
// ─── @route   GET /api/users/search ────────────────────────
// ─── @access  Admin ────────────────────────────────────────

exports.searchDealers = async (req, res, next) => {
  try {
    const { keyword = '' } = req.query;

    const dealers = await User.find({
      role: 'dealer',
      isActive: true,
      $or: [
        {
          name: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          code: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ],
    })
      .select(
        '_id code name phone email address city state'
      )
      .limit(10);

    res.status(200).json({
      success: true,
      dealers,
    });

  } catch (error) {
    next(error);
  }
};
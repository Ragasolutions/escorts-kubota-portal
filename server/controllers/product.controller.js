const Product = require("../models/Product.model");
const cloudinary = require("../config/cloudinary");

// ─── helpers ────────────────────────────────────────────────

// Upload a single buffer to Cloudinary and return { url, public_id }
const uploadToCloudinary = (buffer, folder = "escorts-kubota/products") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      },
    );
    stream.end(buffer);
  });

// ─── @desc    Get all products (with filter + pagination) ───
// ─── @route   GET /api/products ────────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.getProducts = async (req, res, next) => {
  try {
   const { category, brand, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
if (brand) filter.brand = brand;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single product ────────────────────────────
// ─── @route   GET /api/products/:id ────────────────────────
// ─── @access  Private ───────────────────────────────────────

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create product ────────────────────────────────
// ─── @route   POST /api/products ───────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, brand, price, originalPrice, sizes, stock, badge } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, category and price are required",
        });
    }

    const product = await Product.create({
      name,
      description,
      category,
        brand,
      price,
      originalPrice,
      sizes: sizes
        ? typeof sizes === "string"
          ? JSON.parse(sizes)
          : sizes
        : [],
      stock: stock || 0,
      badge,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update product ────────────────────────────────
// ─── @route   PUT /api/products/:id ────────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Parse sizes if sent as JSON string
    if (updates.sizes && typeof updates.sizes === "string") {
      updates.sizes = JSON.parse(updates.sizes);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Soft delete product ───────────────────────────
// ─── @route   DELETE /api/products/:id ─────────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Upload images to a product ────────────────────
// ─── @route   POST /api/products/:id/images ─────────────────
// ─── @access  Admin ─────────────────────────────────────────

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images provided" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // ✅ NEW: Check total images won't exceed 4
    const totalImages = product.images.length + req.files.length;
    if (totalImages > 4) {
      return res.status(400).json({
        success: false,
        message: `Maximum 4 images allowed. This product already has ${product.images.length} image(s).`,
      });
    }

    // Upload all to Cloudinary in parallel
    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    );

    product.images.push(...uploaded);
    await product.save();

    res.status(200).json({ success: true, images: product.images });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete one image from a product ───────────────
// ─── @route   DELETE /api/products/:id/images/:imgId ────────
// ─── @access  Admin ─────────────────────────────────────────

exports.deleteImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const image = product.images.id(req.params.imgId);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Remove from product
    image.deleteOne();
    await product.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Image deleted",
        images: product.images,
      });
  } catch (error) {
    next(error);
  }
};

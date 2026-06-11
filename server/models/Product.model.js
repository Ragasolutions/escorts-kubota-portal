const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: [
    'Cap',
    'Jacket',
    'Shirt',
    'Shirt - Dealer VIP',
    'Shirt - Employees',
    'Shoes',
    'T-Shirt',
    'Trousers',
    'Wind Jacket',
    'Workshop Uniform',
  ],
  required: true,
    },

hsnCode: {
  type: String,
  trim: true,
},

    brand: {
  type: String,
  enum: [
    'Construction Equipment',
    'Farmtrac',
    'GENSET',
    'HO',
    'Kubota',
    'Powertrac',
  ],
  default: null,
},
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },

    sizeGuideType: {
  type: String,
  enum: [
    'male-full-sleeve-shirt',
    'male-half-sleeve-shirt',
    'female-3-4-sleeve-shirt',
    'trouser-male',
    'trouser-female',
    'workshop-supervisor-jacket',
    'workshop-mechanics-top-lower',
  ],
  default: null,
},
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
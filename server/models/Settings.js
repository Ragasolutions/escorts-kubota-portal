const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    rebatePercent: {
      type: Number,
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Settings',
  settingsSchema
);
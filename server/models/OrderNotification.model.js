const mongoose = require('mongoose');

// Tracks order-related email notifications so the same event is never sent
// twice. The unique { order, key } index makes claiming an event atomic:
// a duplicate insert raises a duplicate-key error (code 11000) and the
// duplicate send is skipped. This collection is independent of the Order
// schema and stores outcome data only (it never repeats payment/order logic).

const orderNotificationSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // Event identity, unique per order.
    // Examples: "order_confirmation", "sponsored_order", "status_update:Dispatched"
    key: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['order_confirmation', 'sponsored_order', 'status_update'],
      required: true,
    },

    status: {
      type: String,
      enum: ['sending', 'sent', 'failed'],
      default: 'sending',
    },

    to: {
      type: [String],
      default: [],
    },

    messageId: {
      type: String,
    },

    error: {
      type: String,
    },

    attempts: {
      type: Number,
      default: 1,
    },

    sentAt: {
      type: Date,
    },

    // Lease expiry for an in-flight send. A "sending" record whose lease is
    // null or expired may be claimed by a retry worker; an active (future)
    // lease must not be. Cleared to null on every terminal outcome.
    leaseUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderNotificationSchema.index({ order: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('OrderNotification', orderNotificationSchema);

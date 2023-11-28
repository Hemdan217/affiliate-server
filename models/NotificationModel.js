const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["order_note", "request", "order_status", "ticket"],
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  content: {
    type: String,
  },
  for: {
    type: String,
    enum: ["admin", "marketer", "moderator", "merchant"],
    required: true
  },
  who: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

NotificationSchema.index({
  type: 1,
  is_read: 1,
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
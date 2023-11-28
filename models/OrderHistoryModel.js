const mongoose = require('mongoose');

const OrderHistorySchema = mongoose.Schema({
  vendor: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    default: null
  },
  serial_number: {
    type: String
  },
  status: {
    type: String
  },
  product_name: {
    type: String
  },
  property_name: {
    type: String
  },
  quantity: {
    type: Number
  },
  total_price: {
    type: Number
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

OrderHistorySchema.index({ vendor: 1 });

const OrderHistory = mongoose.model('OrderHistory', OrderHistorySchema);

module.exports = OrderHistory;
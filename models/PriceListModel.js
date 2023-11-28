const mongoose = require('mongoose');

const PriceListSchema = new mongoose.Schema({
  governorate: {
    type: Number,
    unique: true
  },
  price: {
    type: Number,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const PriceList = mongoose.model('PriceList', PriceListSchema);

module.exports = PriceList;
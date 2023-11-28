const mongoose = require('mongoose');

const ShippingCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  },
  site: {
    type: String,
    trim: true,
    lowercase: true,
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

ShippingCompanySchema.index({ name: 'text' });

const ShippingCompany = mongoose.model('ShippingCompany', ShippingCompanySchema);

module.exports = ShippingCompany;
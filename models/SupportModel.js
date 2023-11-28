const mongoose = require('mongoose');

const SupportSchema = mongoose.Schema({
  phone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    lowercase: true,
  },
  for: {
    type: String,
    enum: ["merchant", "marketer"]
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

SupportSchema.index({ phone: 'text', description: 'text' });

const Support = mongoose.model('Support', SupportSchema);

module.exports = Support;
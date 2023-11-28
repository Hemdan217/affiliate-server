const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const RequestSchema = mongoose.Schema({
  role: {
    type: String,
    trim: true,
    lowercase: true
  },
  target: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    default: null
  },
  amount: {
    type: Number,
    trim: true
  },
  phone: {
    type: Number,
    trim: true
  },
  payment_method: {
    type: String,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  note: {
    type: String,
    trim: true,
    lowercase: true,
  },
  reason: {
    type: String,
    trim: true,
    lowercase: true
  },
  actions: [ActionSchema]
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

RequestSchema.index({ payment_method: 'text' });

const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;
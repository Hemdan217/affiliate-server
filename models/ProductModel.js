const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
  warehouse: {
    type: mongoose.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  merchant: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true,
    lowercase: true,
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  sale_price: {
    type: Number,
    trim: true
  },
  purchase_price: {
    type: Number,
    trim: true
  },
  image: {
    type: String,
  },
  description: {
    type: String
  },
  note: {
    type: String,
  },
  media_url: {
    type: String,
    trim: true,
  },
  properties: [{
    key: {
      type: String,
      trim: true
    },
    value: {
      type: Number,
      default: 0
    }
  }],
  is_active: {
    type: Boolean,
    default: false
  },
  access_type: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },
  access_to: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: null
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

ProductSchema.index({ name: 'text', barcode: 'text', access_type: 1 });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
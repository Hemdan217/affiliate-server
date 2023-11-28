const mongoose = require('mongoose');

const WarehouseSchema = mongoose.Schema({
  name: {
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

WarehouseSchema.index({ name: 'text' });

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

module.exports = Warehouse;
const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
  image: {
    type: String
  },
  name: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

CategorySchema.index({ name: 'text' });

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
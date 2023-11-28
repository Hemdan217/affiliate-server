const mongoose = require('mongoose');

const RuleSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  },
  permissions: {
    type: Array,
    default: []
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

RuleSchema.index({ name: 'text' });

const Rule = mongoose.model('Rule', RuleSchema);

module.exports = Rule;
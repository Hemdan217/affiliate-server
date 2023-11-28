const mongoose = require('mongoose');
const { isEmail } = require('validator');

const UserSchema = new mongoose.Schema({
  role: {
    type: String
  },
  name: {
    type: String,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [isEmail, 'invalid email']
  },
  phone: {
    type: String,
  },
  password: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: false
  },
  allow_upload_excel: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const AdminSchema = new mongoose.Schema({
  rule: {
    type: mongoose.Types.ObjectId,
    ref: 'Rule',
    required: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const MerchantSchema = new mongoose.Schema({

}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const MarketerSchema = new mongoose.Schema({

}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const ModeratorSchema = new mongoose.Schema({
  main_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

UserSchema.index({
  name: 'text',
  code: 'text',
  email: 'text',
  phone: 'text'
});

const User = mongoose.model('User', UserSchema);

const Admin = User.discriminator("Admin", AdminSchema);
const Marketer = User.discriminator("Marketer", MarketerSchema);
const Moderator = User.discriminator("Moderator", ModeratorSchema);
const Merchant = User.discriminator("Merchant", MerchantSchema);


module.exports = { User, Admin, Marketer, Moderator, Merchant };

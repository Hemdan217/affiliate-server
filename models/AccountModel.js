const mongoose = require('mongoose');

const AccountSchema = mongoose.Schema({
  pending: {
    type: Number,
    default: 0,
    min: 0
  },
  preparing: {
    type: Number,
    default: 0,
    min: 0
  },
  shipped: {
    type: Number,
    default: 0,
    min: 0
  },
  available: {
    type: Number,
    default: 0
  },
  returned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const MerchantAccountSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Types.ObjectId,
    ref: 'ْUser'
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const MarketerAccountSchema = new mongoose.Schema({
  marketer: {
    type: mongoose.Types.ObjectId,
    ref: 'ْUser',
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});


const Account = mongoose.model('Account', AccountSchema);
const MerchantAccount = Account.discriminator("MerchantAccount", MerchantAccountSchema);
const MarketerAccount = Account.discriminator("MarketerAccount", MarketerAccountSchema);

module.exports = { Account, MerchantAccount, MarketerAccount };
const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  body: {
    type: String,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

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

const OrderSchema = mongoose.Schema({
  status: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'pending',
  },
  holding_to: {
    type: Date,
    default: null
  },
  serial_number: {
    type: String,
    unique: true
  },
  marketer: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderator: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    default: null
  },
  client_name: {
    type: String
  },
  client_phone1: {
    type: String
  },
  client_phone2: {
    type: String
  },
  client_address: {
    type: String
  },
  shipping_governorate: {
    type: mongoose.Types.ObjectId,
    ref: 'PriceList',
  },
  city: {
    type: Number
  },
  shipping: {
    type: Number,
    default: 0
  },
  shipping_company: {
    type: mongoose.Types.ObjectId,
    ref: 'ShippingCompany',
    default: null
  },
  commission: {
    type: Number
  },
  page_name: {
    type: String,
    trim: true
  },
  items: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
      },
      merchant: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      },
      warehouse: {
        type: mongoose.Types.ObjectId,
        ref: 'Warehouse'
      },
      property: {
        type: String
      },
      qty: {
        type: Number
      },
      sale_price: {
        type: Number,
      },
      purchase_price: {
        type: Number
      },
      total_sale_price: {
        type: Number
      },
      total_purchase_price: {
        type: Number
      }
    }
  ],
  total: {
    type: Number
  },
  note: {
    type: String
  },
  replies: [ReplySchema],
  actions: [ActionSchema],
  key: {
    type: Number,
    default: 0
  },
  whats1_clicked: {
    type: Number,
    default: 0
  },
  phone1_clicked: {
    type: Number,
    default: 0
  },
  sms1_clicked: {
    type: Number,
    default: 0
  },
  whats2_clicked: {
    type: Number,
    default: 0
  },
  phone2_clicked: {
    type: Number,
    default: 0
  },
  sms2_clicked: {
    type: Number,
    default: 0
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

OrderSchema.index({
  client_name: 'text',
  client_phone1: 'text',
  client_phone2: 'text',
  serial_number: 1,
  shipping_company: 1
});


const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const { User } = require('../models/UserModel');
const { Types } = require("mongoose");
const paginate = require('../utils/paginate');

const { uploadMedia, updateUploadMedia } = require('../utils/uploadMedia');

const getProducts = async (req, res) => {
  try {
    let { page = 1, size = 10, query, filter } = req.query;

    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (user.role === "marketer") {
      filter = JSON.stringify({
        ...filter ? JSON.parse(filter) : {},
        $or: [
          { access_type: 'public' },
          { access_to: { $in: [userId] } }
        ]
      });
    } else if (user.role === "merchant") {
      filter = JSON.stringify({
        ...filter ? JSON.parse(filter) : {},
        $or: [
          { access_type: 'public' },
          { merchant: userId }
        ]
      })
    }

    const data = await paginate(Product, page, size, query, filter);

    for (let i = 0; i < data.data.length; i++) {
      const item = data.data[i];

      const available = await Order.countDocuments({
        status: "available",
        "items.product": { $in: [item._id] }
      });
      const returned = await Order.countDocuments({
        "items.product": { $in: [item._id] },
        $or: [
          { status: "returned1" },
          { status: "returned2" },
        ]
      });

      const percent = (available / (available + returned)) * 100;
      data.data[i]['percent'] = percent;
    }

    await Product.populate(data.data, [
      { path: 'warehouse', model: 'Warehouse' },
      { path: 'merchant', model: 'User' },
      { path: 'category', model: 'Category' },
      { path: 'access_to', model: 'User' }
    ]);

    res.json(data);
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).lean();

    const available = await Order.countDocuments({
      status: "available",
      "items.product": { $in: [product._id] }
    });
    const returned = await Order.countDocuments({
      "items.product": { $in: [product._id] },
      $or: [
        { status: "returned1" },
        { status: "returned2" },
      ]
    });

    for (let i = 0; i < product.properties.length; i++) {
      const itemProp = product.properties[i];

      const pendingOrders = await Order.aggregate([
        { $match: { status: 'pending', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const preparingOrders = await Order.aggregate([
        { $match: { status: 'preparing', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const shippedOrders = await Order.aggregate([
        { $match: { status: 'shipped', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const skipOrders = await Order.aggregate([
        { $match: { status: 'skip', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const availableOrders = await Order.aggregate([
        { $match: { status: 'available', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const asToReturnOrders = await Order.aggregate([
        { $match: { status: 'ask_to_return', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const holdingOrders = await Order.aggregate([
        { $match: { status: 'holding', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const returned1Orders = await Order.aggregate([
        { $match: { status: 'returned1', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const returned2Orders = await Order.aggregate([
        { $match: { status: 'returned2', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const declined1Orders = await Order.aggregate([
        { $match: { status: 'declined1', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);
      const declined2Orders = await Order.aggregate([
        { $match: { status: 'declined2', 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $unwind: '$items' },
        { $match: { 'items.product': Types.ObjectId(product._id), 'items.property': String(itemProp._id) } },
        { $group: { _id: null, qty: { $sum: '$items.qty' } } }
      ]);

      itemProp.pendingOrders = pendingOrders[0]?.qty || 0;
      itemProp.pendingOrders = pendingOrders[0]?.qty || 0;
      itemProp.preparingOrders = preparingOrders[0]?.qty || 0;
      itemProp.shippedOrders = shippedOrders[0]?.qty || 0;
      itemProp.skipOrders = skipOrders[0]?.qty || 0;
      itemProp.availableOrders = availableOrders[0]?.qty || 0;
      itemProp.asToReturnOrders = asToReturnOrders[0]?.qty || 0;
      itemProp.holdingOrders = holdingOrders[0]?.qty || 0;
      itemProp.returned1Orders = returned1Orders[0]?.qty || 0;
      itemProp.returned2Orders = returned2Orders[0]?.qty || 0;
      itemProp.declined1Orders = declined1Orders[0]?.qty || 0;
      itemProp.declined2Orders = declined2Orders[0]?.qty || 0;
    }

    const percent = (available / (available + returned)) * 100;
    product.percent = percent;

    await Product.populate(product, [
      { path: 'warehouse', model: 'Warehouse' },
      { path: 'merchant', model: 'User' },
      { path: 'category', model: 'Category' },
      { path: 'access_to', model: 'User' }
    ]);

    res.json({
      product
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const createProduct = async (req, res) => {
  try {
    const newRecord = await new Product({
      ...req.body,
      properties: JSON.parse(req.body.properties),
      image: uploadMedia(req, 'image')
    }).save();

    await Product.populate(newRecord, [
      { path: 'warehouse', model: 'Warehouse' },
      { path: 'merchant', model: 'User' },
      { path: 'category', model: 'Category' },
      { path: 'access_to', model: 'User' }
    ]);

    res.json({
      success: true,
      data: newRecord
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.body,
        properties: JSON.parse(req.body.properties),
        image: updateUploadMedia(req, 'image', 'edited_image')
      },
      { new: true }
    ).populate({
      path: 'warehouse',
      model: 'Warehouse'
    }).populate({
      path: 'merchant',
      model: 'User'
    }).populate({
      path: 'category',
      model: 'Category'
    }).populate({
      path: 'access_to',
      model: 'User'
    });

    res.json({
      success: true,
      data: product
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const updateAccessProduct = async (req, res) => {
  try {
    const { access_to, access_type } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        access_to,
        access_type
      },
      { new: true }
    ).populate({
      path: 'warehouse',
      model: 'Warehouse'
    }).populate({
      path: 'merchant',
      model: 'User'
    }).populate({
      path: 'category',
      model: 'Category'
    }).populate({
      path: 'access_to',
      model: 'User'
    });

    res.json({
      success: true,
      data: product
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateAccessProduct,
}
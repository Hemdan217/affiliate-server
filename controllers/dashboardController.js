const moment = require('moment');
const Order = require('../models/OrderModel');
const Request = require('../models/RequestModel');
const Product = require('../models/ProductModel');
const { Types } = require("mongoose");
const { User, Marketer, Merchant } = require('../models/UserModel');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const getStatistics = async (req, res) => {
  try {
    let { filter } = req.query;

    const filterQuery = filter ? JSON.parse(filter) : {};
    if (filterQuery.from && filterQuery.to) {
      filterQuery['created_at'] = {
        $gte: new Date(filterQuery.from),
        $lte: new Date(filterQuery.to)
      }
    };

    delete filterQuery.from;
    delete filterQuery.to;

    if (req.user.role === "marketer") {
      const today = moment().startOf('day');
      const ordersOfToday = await Order.countDocuments({
        "created_at": { $gte: today.toDate() },
        marketer: req.user?._id
      });

      const week = today.add(-7, "days");
      const ordersOfWeek = await Order.countDocuments({
        "created_at": { $gte: week.toDate() },
        marketer: req.user?._id
      });

      const month = today.add(-30, "days");
      const ordersOfMonth = await Order.countDocuments({
        "created_at": { $gte: month.toDate() },
        marketer: req.user?._id
      });

      const totalDoneRequests = await Request.aggregate([
        { $match: { role: "marketer", status: "approved", target: ObjectId(req.user._id), ...filterQuery } },
        { $group: { _id: null, amount: { $sum: "$amount" } } }
      ]);

      const totalSales = await Order.aggregate([
        { $match: { marketer: req.user._id, status: "available", ...filterQuery } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);

      const totalIncome = await Order.aggregate([
        { $match: { marketer: req.user._id, status: "available", ...filterQuery } },
        { $group: { _id: null, commission: { $sum: "$commission" } } }
      ]);

      const totalOrders = await Order.countDocuments({ ...filterQuery, marketer: req.user?._id });
      const available = await Order.countDocuments({ ...filterQuery, marketer: req.user?._id, status: "available" });
      const returned = await Order.countDocuments({
        ...filterQuery,
        marketer: req.user?._id,
        $or: [
          { status: "returned1" },
          { status: "returned2" },
        ]
      });

      const declined = await Order.countDocuments({
        ...filterQuery,
        marketer: req.user?._id,
        $or: [
          { status: "declined1" },
          { status: "declined2" },
        ]
      });
      const restStatus = await Order.countDocuments({
        ...filterQuery,
        marketer: req.user?._id,
        $or: [
          { status: "shipped" },
          { status: "preparing" },
          { status: "holding" },
          { status: "skip" },
          { status: "returned1" },
          { status: "returned2" },
          { status: "ask_to_return" },
          { status: "available" },
        ]
      });
      const percent = (available / (available + returned)) * 100;
      const callCenterQuality = (restStatus / (declined + restStatus)) * 100;

      res.json({
        ordersOfToday,
        ordersOfWeek,
        ordersOfMonth,
        totalOrders,
        totalDoneRequests,
        totalSales,
        totalIncome,
        available,
        returned,
        percent,
        callCenterQuality
      });
    } else if (req.user.role === "moderator") {
      const today = moment().startOf('day');
      const ordersOfToday = await Order.countDocuments({
        "created_at": { $gte: today.toDate() },
        moderator: req.user?._id
      });

      const week = today.add(-7, "days");
      const ordersOfWeek = await Order.countDocuments({
        "created_at": { $gte: week.toDate() },
        moderator: req.user?._id
      });

      const month = today.add(-30, "days");
      const ordersOfMonth = await Order.countDocuments({
        "created_at": { $gte: month.toDate() },
        moderator: req.user?._id
      });

      const totalSales = await Order.aggregate([
        { $match: { moderator: req.user._id, status: "available", ...filterQuery } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);

      const totalOrders = await Order.countDocuments({ ...filterQuery, moderator: req.user?._id });
      const available = await Order.countDocuments({ ...filterQuery, moderator: req.user?._id, status: "available" });
      const returned = await Order.countDocuments({
        ...filterQuery,
        moderator: req.user?._id,
        $or: [
          { status: "returned1" },
          { status: "returned2" },
        ]
      });

      const percent = (available / (available + returned)) * 100;

      res.json({
        ordersOfToday,
        ordersOfWeek,
        ordersOfMonth,
        totalOrders,
        totalSales,
        available,
        returned,
        percent
      });
    } else if (req.user.role === "merchant") {
      const today = moment().startOf('day');
      const ordersOfToday = await Order.countDocuments({
        "created_at": { $gte: today.toDate() },
        "items.merchant": { $in: [req.user._id] }
      });

      const week = today.add(-7, "days");
      const ordersOfWeek = await Order.countDocuments({
        "created_at": { $gte: week.toDate() },
        "items.merchant": { $in: [req.user._id] }
      });

      const month = today.add(-30, "days");
      const ordersOfMonth = await Order.countDocuments({
        "created_at": { $gte: month.toDate() },
        "items.merchant": { $in: [req.user._id] }
      });

      const totalOrders = await Order.countDocuments({ "items.merchant": { $in: [req.user._id] } });

      const totalDoneRequests = await Request.aggregate([
        { $match: { role: "merchant", status: "approved", target: ObjectId(req.user._id), ...filterQuery } },
        { $group: { _id: null, amount: { $sum: "$amount" } } }
      ]);

      const totalSales = await Order.aggregate([
        { $match: { 'items.merchant': Types.ObjectId(req.user._id) } },
        { $unwind: '$items' },
        { $match: { 'items.merchant': Types.ObjectId(req.user._id) } },
        { $group: { _id: null, total: { $sum: '$items.total_purchase_price' } } }
      ]);

      const totalIncome = await Order.aggregate([
        { $match: { 'items.merchant': Types.ObjectId(req.user._id) } },
        { $unwind: '$items' },
        { $match: { 'items.merchant': Types.ObjectId(req.user._id) } },
        { $group: { _id: null, commission: { $sum: '$items.total_purchase_price' } } }
      ]);

      const available = await Order.countDocuments({
        status: "available",
        "items.merchant": { $in: [req.user._id] }
      });
      const returned = await Order.countDocuments({
        "items.merchant": { $in: [req.user._id] },
        $or: [
          { status: "returned1" },
          { status: "returned2" },
        ]
      });

      const percent = (available / (available + returned)) * 100;

      res.json({
        ordersOfToday,
        ordersOfWeek,
        ordersOfMonth,
        totalOrders,
        totalDoneRequests,
        totalSales,
        totalIncome,
        available,
        returned,
        percent
      });
    } else if (req.user.role === "admin") {
      const today = moment().startOf('day');
      const ordersOfToday = await Order.countDocuments({
        "created_at": { $gte: today.toDate() },
      });

      const week = today.add(-7, "days");
      const ordersOfWeek = await Order.countDocuments({
        "created_at": { $gte: week.toDate() },
      });

      const month = today.add(-30, "days");
      const ordersOfMonth = await Order.countDocuments({
        "created_at": { $gte: month.toDate() },
      });

      const totalDoneRequests = await Request.aggregate([
        { $match: { status: "approved", ...filterQuery } },
        { $group: { _id: null, amount: { $sum: "$amount" } } }
      ]);

      const totalSales = await Order.aggregate([
        { $match: { status: "available", ...filterQuery } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);

      const totalSalePrice = await Order.aggregate([
        { $match: { status: "available", ...filterQuery } },
        { $unwind: "$items" },
        { $group: { _id: null, totalSalePrice: { $sum: "$items.total_sale_price" } } }
      ]);

      const totalPurchasePrice = await Order.aggregate([
        { $match: { status: "available", ...filterQuery } },
        { $unwind: "$items" },
        { $group: { _id: null, totalPurchasePrice: { $sum: "$items.total_purchase_price" } } }
      ]);

      const totalIncomeCalc = (totalSalePrice[0]?.totalSalePrice || 0) - (totalPurchasePrice[0]?.totalPurchasePrice || 0);
      const totalIncome = [{ commission: totalIncomeCalc }];

      const totalOrders = await Order.countDocuments({ ...filterQuery });
      const available = await Order.countDocuments({ ...filterQuery, status: "available" });
      const returned = await Order.countDocuments({
        ...filterQuery,
        $or: [
          { status: "returned1" },
          { status: "returned2" },
        ]
      });
      const declined = await Order.countDocuments({
        ...filterQuery,
        $or: [
          { status: "declined1" },
          { status: "declined2" },
        ]
      });
      const restStatus = await Order.countDocuments({
        ...filterQuery,
        $or: [
          { status: "shipped" },
          { status: "preparing" },
          { status: "holding" },
          { status: "skip" },
          { status: "returned1" },
          { status: "returned2" },
          { status: "ask_to_return" },
          { status: "available" },
        ]
      });
      const percent = (available / (available + returned)) * 100;
      const callCenterQuality = (restStatus / (declined + restStatus)) * 100;

      const totalProducts = await Product.countDocuments({});
      const activeProducts = await Product.countDocuments({ is_active: true });
      const disActiveProducts = await Product.countDocuments({ is_active: false });
      const users = await User.countDocuments();
      const marketers = await Marketer.countDocuments();
      const merchants = await Merchant.countDocuments();
      const mostMarketers = await Order.aggregate([
        { $group: { _id: '$marketer', orderCount: { $sum: 1 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
      ]);

      const marketersOfWeek = await Order.aggregate([
        { $match: { created_at: { $gte: week.toDate() } } },
        { $group: { _id: '$marketer', orderCount: { $sum: 1 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
      ]);

      const marketersOfMonth = await Order.aggregate([
        { $match: { created_at: { $gte: month.toDate() } } },
        { $group: { _id: '$marketer', orderCount: { $sum: 1 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
      ])

      res.json({
        ordersOfToday,
        ordersOfWeek,
        ordersOfMonth,
        totalOrders,
        totalDoneRequests,
        totalSales,
        totalIncome,
        available,
        returned,
        percent,
        callCenterQuality,
        totalProducts,
        activeProducts,
        disActiveProducts,
        users,
        marketers,
        merchants,
        mostMarketers,
        marketersOfWeek,
        marketersOfMonth
      });
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong!' }]
    })
  }
}

module.exports = { getStatistics };
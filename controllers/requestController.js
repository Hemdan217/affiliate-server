const Request = require('../models/RequestModel');
const { MarketerAccount, MerchantAccount, Account } = require('../models/AccountModel');
const Notification = require("../models/NotificationModel");

const getRequests = async (req, res) => {
  try {
    let { page = 1, size = 10, query, filter } = req.query;
    let searchQuery = query ? { $text: { $search: query } } : {};
    const filterQuery = filter ? JSON.parse(filter) : {};

    const roleFilter = {
      merchant: { target: req.user._id },
      marketer: { target: req.user._id },
      admin: {}
    }

    if (filterQuery.from && filterQuery.to) {
      filterQuery['created_at'] = {
        $gte: filterQuery.from,
        $lte: filterQuery.to
      }
    };

    const itemsCount = await Request.countDocuments({ ...searchQuery, ...filterQuery, ...roleFilter[req.user.role] });
    let data = await Request.find({ ...searchQuery, ...filterQuery, ...roleFilter[req.user.role] })
      .limit(size)
      .skip((page - 1) * size)
      .lean()
      .sort('-updated_at')
      .populate({
        path: 'target',
        model: 'User',
      });

    res.json({
      success: true,
      itemsCount,
      pages: Math.ceil(itemsCount / size),
      data,
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const createRequest = async (req, res) => {
  try {
    const { amount } = req.body;

    if (+amount < 50) throw new Error("اقل قيمة سحب ٥٠ جنية");

    let account;
    if (req.user.role === "merchant") {
      account = await MerchantAccount.findOne({ merchant: req.user._id })
    } else {
      account = await MarketerAccount.findOne({ marketer: req.user._id });
    }
    if (!account || +amount > account.available) throw new Error('لا يوجد لديك مبلغ كافي قابل للسحب!');

    const isHasPrevReq = await Request.findOne({ status: "pending", role: req.user.role, target: req.user._id });
    if (isHasPrevReq) throw new Error('لقد قمت بعملية سحب سابقة يرجى الانتظار لحين قبول الطلب الاخر');

    const newRecord = await new Request({
      role: req.user.role,
      target: req.user._id,
      ...req.body
    }).save();

    await Request.populate(newRecord, {
      path: 'target',
      model: 'User'
    });

    await new Notification({
      type: "request",
      content: `هناك طلب سحب ${amount} من قبل ${newRecord?.target?.name}`,
      for: "admin",
      who: []
    }).save();

    res.json({
      success: true,
      data: newRecord
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': error?.message || 'something went wrong' }]
    });
  }
}

const updateRequest = async (req, res) => {
  try {
    const { status, reason } = req.body;

    let request = await Request.findById(req.params.requestId);
    if (!request) throw "requests.request_does_not_exists";

    if (status === "approved") {
      if (request.role === "merchant") {
        let merchantAccount = await MerchantAccount.findOne({ merchant: request.target._id });
        if ((merchantAccount.available - request.amount) < 0) {
          throw "requests.invalid_amount";
        }
      } else if (request.role === "marketer") {
        let marketerAccount = await MarketerAccount.findOne({ marketer: request.target._id });
        if ((marketerAccount.available - request.amount) < 0) {
          throw "requests.invalid_amount";
        }
      }
    }

    request = await Request.findByIdAndUpdate(
      req.params.requestId,
      {
        status,
        reason,
        $push: { actions: { admin: req.user._id, status } },
      },
      { new: true }
    ).populate({ path: 'target', model: 'User' });

    const notification = {
      type: "request",
      for: request.role,
      who: [request.target?._id],
    }

    if (status === "approved") {
      if (request.role === "merchant") {
        let merchantAccount = await MerchantAccount.findOne({ merchant: request.target._id });
        merchantAccount.available -= request.amount;
        await merchantAccount.save();
      } else if (request.role === "marketer") {
        let marketerAccount = await MarketerAccount.findOne({ marketer: request.target._id });
        marketerAccount.available -= request.amount;
        await marketerAccount.save();
      }
      await new Notification({ ...notification, content: `تم قبول طلب سحب (${request.amount})` }).save();
    } else {
      await new Notification({ ...notification, content: `تم رفض طلب سحب (${request.amount})` }).save();
    }

    res.json({
      success: true,
      data: request
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

const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.requestId);

    const account = await Account.findOne({ [request.type]: request.target });

    await Account.findByIdAndUpdate(account._id, { available: account.available + request.amount });

    res.json({
      success: true,
      data: request
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
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest
}
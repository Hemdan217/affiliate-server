const Support = require('../models/SupportModel');
const paginate = require('../utils/paginate');

const getSupports = async (req, res) => {
  let { page = 1, size = 10, query, filter } = req.query;

  try {
    let data = await paginate(Support, page, size, query, filter);

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

const createSupport = async (req, res) => {
  try {
    const newRecord = await new Support(req.body).save();

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

const updateSupport = async (req, res) => {
  try {
    const support = await Support.findByIdAndUpdate(
      req.params.supportId,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: support
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

const deleteSupport = async (req, res) => {
  try {
    const support = await Support.findByIdAndDelete(req.params.supportId);

    res.json({
      success: true,
      data: support
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}


module.exports = {
  getSupports,
  createSupport,
  updateSupport,
  deleteSupport
}
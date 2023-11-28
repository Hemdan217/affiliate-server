const ShippingCompany = require('../models/ShippingCompanyModel');

const paginate = require('../utils/paginate');


const getShippingCompanies = async (req, res) => {
  try {
    const { page = 1, size = 10, query, filter } = req.query;
    const data = await paginate(ShippingCompany, page, size, query, filter);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}


const createShippingCompany = async (req, res) => {
  try {
    const newRecord = new ShippingCompany(req.body);
    await newRecord.save();

    res.json({
      success: true,
      data: newRecord
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const updateShippingCompany = async (req, res) => {
  try {
    const shippingCompanyId = req.params.shippingCompanyId;

    const data = await ShippingCompany.findByIdAndUpdate(
      shippingCompanyId,
      req.body,
      { new: true }
    )

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const deleteShippingCompany = async (req, res) => {
  try {
    const shippingCompanyId = req.params.shippingCompanyId;

    const data = await ShippingCompany.findByIdAndRemove(shippingCompanyId);

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

module.exports = {
  getShippingCompanies,
  createShippingCompany,
  updateShippingCompany,
  deleteShippingCompany
}
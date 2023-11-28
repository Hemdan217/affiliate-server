const PriceList = require('../models/PriceListModel');

const paginate = require('../utils/paginate');


const getPriceList = async (req, res) => {
  try {
    const { page = 1, size = 10, query, filter } = req.query;
    const data = await paginate(PriceList, page, size, query, filter);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}


const createPriceList = async (req, res) => {
  try {
    const newRecord = new PriceList(req.body);
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

const updatePriceList = async (req, res) => {
  try {
    const priceListId = req.params.priceListId;

    const data = await PriceList.findByIdAndUpdate(
      priceListId,
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

module.exports = {
  getPriceList,
  createPriceList,
  updatePriceList
}
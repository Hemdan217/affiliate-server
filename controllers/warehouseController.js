const Warehouse = require('../models/WarehouseModel');
const paginate = require('../utils/paginate');

const getWarehouses = async (req, res) => {
  try {
    let { page = 1, size = 10, query, filter } = req.query;
    const data = await paginate(Warehouse, page, size, query, filter);

    res.json(data);
  }
  catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const createWarehouse = async (req, res) => {
  try {
    const newRecord = await new Warehouse(req.body);
    await newRecord.save();

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

const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.warehouseId,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: warehouse
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

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.warehouseId);

    res.json({
      success: true,
      data: warehouse
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
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
}
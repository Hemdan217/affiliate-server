const Category = require('../models/CategoryModel');
const paginate = require('../utils/paginate');

const { uploadMedia, updateUploadMedia } = require('../utils/uploadMedia');

const getCategories = async (req, res) => {
  let { page = 1, size = 10, query, filter } = req.query;

  try {
    let data = await paginate(Category, page, size, query, filter);

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

const createCategory = async (req, res) => {
  try {
    const newRecord = await new Category({
      ...req.body,
      image: uploadMedia(req, 'image')
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
      errors: [{ 'msg': 'something went wrong' }]
    });
  }
}

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      {
        ...req.body,
        image: updateUploadMedia(req, 'image', 'edited_image')
      },
      { new: true }
    );

    res.json({
      success: true,
      data: category
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

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);

    res.json({
      success: true,
      data: category
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}
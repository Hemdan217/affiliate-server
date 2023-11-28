const Rule = require('../models/RuleModel');
const paginate = require('../utils/paginate');

const getRules = async (req, res) => {
  let { page = 1, size = 10, query, filter } = req.query;

  try {
    let data = await paginate(Rule, page, size, query, filter);

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

const createRule = async (req, res) => {
  try {
    const newRecord = await new Rule(req.body);
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

const updateRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.ruleId,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: rule
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

const deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.ruleId);

    res.json({
      success: true,
      data: rule
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
  getRules,
  createRule,
  updateRule,
  deleteRule
}
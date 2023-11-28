const bcrypt = require("bcrypt");
const { Moderator } = require("../models/UserModel");
const paginate = require("../utils/paginate");
const { generator } = require("../utils/generator");

const getModerators = async (req, res) => {
  try {
    let { page = 1, size = 10, query, filter } = req.query;
    let filterQ = filter ? JSON.parse(filter) : {};
    filterQ.main_account = req.user._id;
    filter = JSON.stringify(filterQ);
    const data = await paginate(Moderator, page, size, query, filter);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const createModerator = async (req, res) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    if (req.body.role == "admin") throw "auth.one_admin";
    const newRecord = await new Moderator({
      ...req.body,
      main_account: req.user._id,
      code: generator({ length: 8 }),
      password: hashPassword,
    }).save();

    res.json({
      success: true,
      data: newRecord,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const updateModerator = async (req, res) => {
  try {
    if (req.body.role == "admin") throw "auth.one_admin";
    const moderator = await Moderator.findByIdAndUpdate(
      req.params.moderatorId,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: moderator,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

module.exports = {
  getModerators,
  createModerator,
  updateModerator,
};

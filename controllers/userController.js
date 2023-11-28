const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/UserModel");
const paginate = require("../utils/paginate");

const { generator } = require("../utils/generator");
const { getUserModel } = require("../utils/model");

const getUsers = async (req, res) => {
  try {
    if (req.user.role != "admin") {
      req.query.filter = JSON.stringify({ _id: req.user._id });
    }
    let { page = 1, size = 10, query, filter } = req.query;
    const data = await paginate(User, page, size, query, filter);

    await User.populate(data.data, {
      path: "rule",
      model: "Rule",
    });

    res.json(data);
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const createUser = async (req, res) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const UserModel = getUserModel(req.body.role);
    if (!UserModel) throw "auth.invalid_role";

    // if (req.body.role == "admin") throw "auth.one_admin";
    req.body.is_active = false;
    const newRecord = await new UserModel({
      ...req.body,
      code: generator({ length: 8 }),
      password: hashPassword,
    }).save();

    await User.populate(newRecord, {
      path: "rule",
      model: "Rule",
    });

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

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    }).populate({ path: "rule", model: "Rule" });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const openUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user.is_active)
      return res
        .status(400)
        .json({ success: false, errors: [{ msg: "لم يتم تفعيل حسابك بعد!" }] });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    if (!token)
      return res
        .status(400)
        .json({ success: false, errors: [{ msg: "حدث خطا ما" }] });

    res.json({
      token,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.body.new_password !== req.body.confirm_new_password) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "password must be the same!" }],
      });
    }

    const user = await User.findOne({ _id: userId });

    const verifyPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifyPassword) {
      return res
        .status(400)
        .json({ success: false, errors: [{ msg: "try again later" }] });
    }

    const hashPassword = await bcrypt.hash(req.body.new_password, 10);

    const newRecord = await User.findByIdAndUpdate(
      user?._id,
      {
        password: hashPassword,
      },
      { new: true }
    );

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

module.exports = {
  getUsers,
  createUser,
  updateUser,
  openUser,
  updateUserPassword,
};

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../emails/resetPasswordMail");
const { User } = require("../models/UserModel");
const { generator } = require("../utils/generator");
const { getUserModel } = require("../utils/model");

const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.trim().toLowerCase(),
    });
    if (!user) throw "auth.user_not_found";

    if (!user.is_active) throw "auth.user_is_not_active";

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) throw "auth.invalid_credintials";

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });
    if (!token) throw "global.something_went_wrong";

    res.json({ token, user });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      success: false,
      errors: [{ msg: "login again ..." }],
    });
  }
};

const register = async (req, res) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    if (!hashPassword) throw "global.something_went_wrong";

    const UserModel = getUserModel(req.body.role);
    if (!UserModel) throw "auth.invalid_role";

    const user = await new UserModel({
      ...req.body,
      code: generator({ length: 8 }),
      password: hashPassword,
    }).save();

    res.json({ user });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      errors: [{ msg: "something went wrong" }],
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.trim().toLowerCase(),
    });
    if (!user) throw "auth.user_not_found";

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    if (!token) throw "auth.user_not_found";

    sendResetPasswordEmail(user.email, token);

    res.json({ user });
  } catch (e) {
    return res.status(400).json({
      success: false,
      errors: [{ msg: "try again later ..." }],
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) throw "auth.token_is_required";

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    if (!hashPassword) throw "global.something_went_wrong";

    await User.findByIdAndUpdate(user._id, {
      password: hashPassword,
    });
    res.json({
      success: true,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      errors: [{ msg: "try again later ..." }],
    });
  }
};

const checkAuthentication = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) throw "auth.login_again";
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id }).populate({
      path: "rule",
      model: "Rule",
    });

    if (!user) throw "user_not_found";

    const newToken = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    return res.json({
      token: newToken,
      user,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      errors: [{ msg: "سجل دخول مرة أخرى" }],
    });
  }
};

module.exports = {
  login,
  register,
  resetPassword,
  changePassword,
  checkAuthentication,
};

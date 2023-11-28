const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");

const authGuard = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) throw "auth.login_again";

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await User.findOne({ _id: decoded.id }).populate({
        path: "rule",
        model: "Rule",
      });
      if (!user || !user.is_active) throw "user_not_found";
      req.user = user;
      // console.log(req.user);
      next();
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      success: false,
      errors: [{ msg: "token is not valid" }],
    });
  }
};

const allowedTo =
  (...roles) =>
  async (req, res, next) => {
    try {
      // console.log(req.user.role);
      if (!roles.includes(req.user.role)) {
        throw "auth.not_allowed";
      }
      next();
    } catch (e) {
      console.log(e);
      return res.status(401).json({
        success: false,
        errors: [{ msg: "not allowed" }],
      });
    }
  };
const allowedToPermissions = (permission) => async (req, res, next) => {
  try {
    if (!req.user.rule.permissions.includes(permission)) {
      throw "auth.not_allowed";
    }
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      success: false,
      errors: [{ msg: "not allowed" }],
    });
  }
};
const allowedToMEADmin = async (req, res, next) => {
  try {
    if (req.user._id == req.params.userId || req.user.role == "admin") {
      next();
    } else {
      throw "auth.not_allowed";
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      success: false,
      errors: [{ msg: "not allowed" }],
    });
  }
};

module.exports = {
  allowedTo,
  authGuard,
  allowedToMEADmin,
  allowedToPermissions,
};

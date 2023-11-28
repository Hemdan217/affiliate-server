const jwt = require('jsonwebtoken');
const { User } = require("../models/UserModel");

const authGuard = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) throw "auth.login_again";

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await User.findOne({ _id: decoded.id })
        .populate({ path: "rule", model: "Rule" });
      req.user = user;
      next();
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      success: false,
      errors: [{ 'msg': 'token is not valid' }]
    });
  }

}


module.exports = authGuard
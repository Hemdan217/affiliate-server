const { Marketer, Merchant, Moderator, Admin } = require("../models/UserModel");

const getUserModel = (role) => {
  switch (role) {
    case "marketer":
      return Marketer
    case "merchant":
      return Merchant
    case "moderator":
      return Moderator
    case "admin":
      return Admin
    default:
      return null
  }
}

module.exports = { getUserModel }
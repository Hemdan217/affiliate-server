const router = require("express").Router();
const { getAccounts } = require("../controllers/accountController");

const { authGuard, allowedTo } = require("../middlewares/authGuard");

router.get(
  "/get_accounts",
  authGuard,
  allowedTo("admin", "merchant", "marketer", "moderator"),
  getAccounts
);

module.exports = router;

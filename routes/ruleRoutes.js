const router = require("express").Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} = require("../controllers/ruleController");

const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get(
  "/get_rules",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  getRules
);

router.post(
  "/create_rule",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  createRule
);

router.put(
  "/update_rule/:ruleId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  updateRule
);

router.delete(
  "/delete_rule/:ruleId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  deleteRule
);

module.exports = router;

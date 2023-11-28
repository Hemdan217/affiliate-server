const router = require("express").Router();
const {
  getUsers,
  createUser,
  updateUser,
  openUser,
  updateUserPassword,
} = require("../controllers/userController");

const {
  authGuard,
  allowedTo,
  allowedToMEADmin,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get(
  "/get_users",
  authGuard,
  // allowedTo("admin"),
  // allowedToPermissions("manage_users"),
  getUsers
);

router.post(
  "/create_user",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_users"),
  createUser
);

router.put("/update_user/:userId", authGuard, allowedToMEADmin, updateUser);

router.post(
  "/open_user/:userId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_users"),
  openUser
);

router.put(
  "/update_user_password/:userId",
  authGuard,
  allowedToMEADmin,
  updateUserPassword
);

module.exports = router;

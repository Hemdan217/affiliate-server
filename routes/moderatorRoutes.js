const router = require("express").Router();
const {
  getModerators,
  createModerator,
  updateModerator,
} = require("../controllers/moderatorController");

const { authGuard, allowedTo } = require("../middlewares/authGuard");

router.get("/get_moderators", authGuard, getModerators);

router.post(
  "/create_moderator",
  authGuard,
  allowedTo("marketer"),
  createModerator
);

router.put(
  "/update_moderator/:moderatorId",
  authGuard,
  allowedTo("marketer", "moderator"),
  updateModerator
);

module.exports = router;

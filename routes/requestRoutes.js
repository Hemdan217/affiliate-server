const router = require("express").Router();
const {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} = require("../controllers/requestController");

const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get("/get_requests", authGuard, getRequests);

router.post("/create_request", authGuard, createRequest);

router.put(
  "/update_request/:requestId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_requests"),
  updateRequest
);

router.delete(
  "/delete_request/:requestId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_requests"),

  deleteRequest
);

module.exports = router;

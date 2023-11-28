const router = require("express").Router();
const {
  getOrders,
  createOrder,
  createOrders,
  updateOrder,
  updateOrdersStatus,
  updateOrderShippingCompany,
  createOrderNote,
  checkDuplicateOrder,
  getNextOrder,
  updatedOrderCallAction,
} = require("../controllers/orderController");

const { authGuard, allowedTo } = require("../middlewares/authGuard");

router.get(
  "/get_orders",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  getOrders
);

router.post(
  "/create_order",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  createOrder
);

router.post(
  "/create_orders",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  createOrders
);

router.put(
  "/update_order/:orderId",
  authGuard,
  allowedTo("admin"),
  updateOrder
);

router.put(
  "/update_orders_status",
  authGuard,
  allowedTo("admin"),
  updateOrdersStatus
);

router.put(
  "/update_order_shipping_company",
  authGuard,
  allowedTo("admin"),
  updateOrderShippingCompany
);

router.post(
  "/create_order_note/:orderId",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  createOrderNote
);

router.post(
  "/check_duplicate_order",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  checkDuplicateOrder
);

router.get(
  "/get_next_order/:date",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  getNextOrder
);

router.put(
  "/update_order_call_action/:orderId",
  authGuard,
  allowedTo("admin", "moderator", "merchant", "marketer"),
  updatedOrderCallAction
);

module.exports = router;

const router = require('express').Router();
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
  updatedOrderCallAction
} = require('../controllers/orderController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_orders',
  authGuard,
  getOrders
);

router.post(
  '/create_order',
  authGuard,
  createOrder
);

router.post(
  '/create_orders',
  authGuard,
  createOrders
);

router.put(
  '/update_order/:orderId',
  authGuard,
  updateOrder
);

router.put(
  '/update_orders_status',
  authGuard,
  updateOrdersStatus
);

router.put(
  '/update_order_shipping_company',
  authGuard,
  updateOrderShippingCompany
);

router.post(
  '/create_order_note/:orderId',
  authGuard,
  createOrderNote
);

router.post(
  '/check_duplicate_order',
  authGuard,
  checkDuplicateOrder
);

router.get(
  '/get_next_order/:date',
  authGuard,
  getNextOrder
);

router.put(
  '/update_order_call_action/:orderId',
  authGuard,
  updatedOrderCallAction
);

module.exports = router;
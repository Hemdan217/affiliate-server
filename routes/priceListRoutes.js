const router = require("express").Router();

const {
  getPriceList,
  createPriceList,
  updatePriceList,
} = require("../controllers/priceListController");
const { authGuard, allowedTo } = require("../middlewares/authGuard");

router.get("/get_price_list", authGuard, getPriceList);

router.post(
  "/create_price_list",
  authGuard,
  allowedTo("admin"),
  createPriceList
);

router.put(
  "/update_price_list/:priceListId",
  authGuard,
  allowedTo("admin"),
  updatePriceList
);

module.exports = router;

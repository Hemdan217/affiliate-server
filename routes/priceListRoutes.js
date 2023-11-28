const router = require('express').Router();

const {
  getPriceList,
  createPriceList,
  updatePriceList
} = require('../controllers/priceListController');


router.get(
  '/get_price_list',
  getPriceList
);

router.post(
  '/create_price_list',
  createPriceList
);

router.put(
  '/update_price_list/:priceListId',
  updatePriceList
);

module.exports = router;
const router = require('express').Router();

const {
  getShippingCompanies,
  createShippingCompany,
  updateShippingCompany,
  deleteShippingCompany
} = require('../controllers/shippingCompanyController');


router.get(
  '/get_shipping_companies',
  getShippingCompanies
);

router.post(
  '/create_shipping_company',
  createShippingCompany
);

router.put(
  '/update_shipping_company/:shippingCompanyId',
  updateShippingCompany
);

router.delete(
  '/delete_shipping_company/:shippingCompanyId',
  deleteShippingCompany
);

module.exports = router;
const router = require("express").Router();

const {
  getShippingCompanies,
  createShippingCompany,
  updateShippingCompany,
  deleteShippingCompany,
} = require("../controllers/shippingCompanyController");
const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get(
  "/get_shipping_companies",
  authGuard,
  // allowedTo("admin"),
  // allowedToPermissions("manage_settings"),
  getShippingCompanies
);

router.post(
  "/create_shipping_company",

  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  createShippingCompany
);

router.put(
  "/update_shipping_company/:shippingCompanyId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  updateShippingCompany
);

router.delete(
  "/delete_shipping_company/:shippingCompanyId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  deleteShippingCompany
);

module.exports = router;

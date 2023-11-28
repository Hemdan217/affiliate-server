const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateAccessProduct,
} = require("../controllers/productController");

const multerMiddleware = require("../middlewares/multerMiddleware");

const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get("/get_products/:userId", authGuard, getProducts);

router.get("/products/:productId", authGuard, getProductById);

router.post(
  "/create_product",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_products"),

  multerMiddleware("products").fields([{ name: "image" }]),
  createProduct
);

router.put(
  "/update_product/:productId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_products"),

  multerMiddleware("products").fields([{ name: "image" }]),
  updateProduct
);

router.put(
  "/update_access_product/:productId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_products"),
  updateAccessProduct
);

module.exports = router;

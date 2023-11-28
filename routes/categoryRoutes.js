const router = require("express").Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const multerMiddleware = require("../middlewares/multerMiddleware");

const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get(
  "/get_categories",
  authGuard,
  allowedTo("admin", "merchant", "marketer", "moderator"),

  getCategories
);

router.post(
  "/create_category",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  multerMiddleware("categories").fields([{ name: "image", maxCount: 1 }]),
  createCategory
);

router.put(
  "/update_category/:categoryId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  multerMiddleware("categories").fields([{ name: "image", maxCount: 1 }]),
  updateCategory
);

router.delete(
  "/delete_category/:categoryId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_settings"),
  deleteCategory
);

module.exports = router;

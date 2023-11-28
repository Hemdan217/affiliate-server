const router = require("express").Router();
const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require("../controllers/warehouseController");

const multerMiddleware = require("../middlewares/multerMiddleware");

const {
  authGuard,
  allowedTo,
  allowedToPermissions,
} = require("../middlewares/authGuard");

router.get("/get_warehouses", authGuard, getWarehouses);

router.post(
  "/create_warehouse",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_warehouses"),
  multerMiddleware("warehouses").fields([{ name: "image", maxCount: 1 }]),
  createWarehouse
);

router.put(
  "/update_warehouse/:warehouseId",
  authGuard,
  allowedTo("admin"),
  allowedToPermissions("manage_warehouses"),

  multerMiddleware("warehouses").fields([{ name: "image", maxCount: 1 }]),
  updateWarehouse
);

router.delete(
  "/delete_warehouse/:warehouseId",
  authGuard,
  allowedTo("admin"),
  deleteWarehouse
);

module.exports = router;

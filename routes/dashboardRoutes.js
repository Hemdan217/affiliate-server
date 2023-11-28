const router = require("express").Router();
const { getStatistics } = require("../controllers/dashboardController");

const { authGuard } = require("../middlewares/authGuard");

router.get("/get_statistics", authGuard, getStatistics);

module.exports = router;

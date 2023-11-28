const router = require('express').Router();
const {
  getSupports,
  createSupport,
  updateSupport,
  deleteSupport
} = require('../controllers/supportController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_supports',
  authGuard,
  getSupports
);

router.post(
  '/create_support',
  authGuard,
  createSupport
);

router.put(
  '/update_support/:supportId',
  authGuard,
  updateSupport
);

router.delete(
  '/delete_support/:supportId',
  authGuard,
  deleteSupport
);

module.exports = router;
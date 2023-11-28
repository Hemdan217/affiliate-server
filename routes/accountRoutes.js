const router = require('express').Router();
const { getAccounts } = require('../controllers/accountController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_accounts',
  authGuard,
  getAccounts
);

module.exports = router;
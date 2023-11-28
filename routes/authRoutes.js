const router = require('express').Router();
const {
  login,
  register,
  checkAuthentication,
  resetPassword,
  changePassword
} = require('../controllers/authController');

router.post(
  '/login',
  login
);

router.post(
   '/register',
   register
 );

router.post(
  '/check_auth',
  checkAuthentication
);

router.post(
  '/reset_password',
  resetPassword
);

router.post(
  '/change_password/:token',
  changePassword
);


module.exports = router;

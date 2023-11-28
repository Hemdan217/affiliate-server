const router = require('express').Router();
const {
  getUsers,
  createUser,
  updateUser,
  openUser,
  updateUserPassword
} = require('../controllers/userController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_users',
  authGuard,
  getUsers
);

router.post(
  '/create_user',
  authGuard,
  createUser
);

router.put(
  '/update_user/:userId',
  authGuard,
  updateUser
);

router.post(
  '/open_user/:userId',
  authGuard,
  openUser
);

router.put(
  '/update_user_password/:userId',
  authGuard,
  updateUserPassword
);


module.exports = router;
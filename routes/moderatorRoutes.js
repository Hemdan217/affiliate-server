const router = require('express').Router();
const {
  getModerators,
  createModerator,
  updateModerator
} = require('../controllers/moderatorController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_moderators',
  authGuard,
  getModerators
);

router.post(
  '/create_moderator',
  authGuard,
  createModerator
);

router.put(
  '/update_moderator/:moderatorId',
  authGuard,
  updateModerator
);


module.exports = router;
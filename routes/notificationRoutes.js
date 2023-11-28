const router = require('express').Router();
const {
  getNotifications,
  updateNotification,
  updateNotifications
} = require('../controllers/notificationController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_notifications',
  authGuard,
  getNotifications
);

router.put(
  '/update_notification/:notificationId',
  authGuard,
  updateNotification
);

router.put(
  '/update_notifications',
  authGuard,
  updateNotifications
);

module.exports = router;
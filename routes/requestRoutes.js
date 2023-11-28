const router = require('express').Router();
const {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controllers/requestController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_requests',
  authGuard,
  getRequests
);

router.post(
  '/create_request',
  authGuard,
  createRequest
);

router.put(
  '/update_request/:requestId',
  authGuard,
  updateRequest
);

router.delete(
  '/delete_request/:requestId',
  authGuard,
  deleteRequest
);


module.exports = router;
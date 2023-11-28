const router = require('express').Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/ruleController');

const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_rules',
  authGuard,
  getRules
);

router.post(
  '/create_rule',
  authGuard,
  createRule
);

router.put(
  '/update_rule/:ruleId',
  authGuard,
  updateRule
);

router.delete(
  '/delete_rule/:ruleId',
  authGuard,
  deleteRule
);

module.exports = router;
const router = require('express').Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const multerMiddleware = require('../middlewares/multerMiddleware');


const authGuard = require('../middlewares/authGuard');


router.get(
  '/get_categories',
  authGuard,
  getCategories
);

router.post(
  '/create_category',
  authGuard,
  multerMiddleware('categories').fields([
    { name: 'image', maxCount: 1 }
  ]),
  createCategory
);

router.put(
  '/update_category/:categoryId',
  authGuard,
  multerMiddleware('categories').fields([
    { name: 'image', maxCount: 1 }
  ]),
  updateCategory
);

router.delete(
  '/delete_category/:categoryId',
  authGuard,
  deleteCategory
)

module.exports = router;
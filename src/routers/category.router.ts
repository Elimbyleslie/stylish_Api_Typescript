import checkPermission from '../middlewares/checkPermission.js';
import { createCategorySchema } from '../validations/category.validations.js';
import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCategory,
  destroyCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
} from '../controllers/category.controller.js';
const router = express.Router();

// router.get('/', checkPermission('CATEGORY_GET_ALL'), getAllCategory);
router.get('/', getAllCategory);
router.get('/:id', getCategoryById);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', destroyCategory);

export default router;

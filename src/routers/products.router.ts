import checkPermission from '../middlewares/checkPermission.js';
import { productSchema } from '../yupValidation/product.validation.js';
import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProduct,
  destroyProduct,
  getAllProduct,
  getProductById,
  updateProduct,
} from '../controllers/Products.controller.js';

const router = express.Router();

router.post('/', validate(productSchema), createProduct);

router.get('/', getAllProduct);
router.get('/:id', async (req, res, next) => {
  await getProductById(req, res, next);
});
router.put('/:id', async (req, res, next) => {
  await updateProduct(req, res, next);
});
router.delete('/:id', async (req, res, next) => {
  await destroyProduct(req, res, next);
});

export default router;

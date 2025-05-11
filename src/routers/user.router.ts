import { createdUserSchema } from '../validations/user.validations.js';
import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { createUser, destroyUser, getAllUser, getUserById, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getAllUser);
router.get('/:id', getUserById);
router.post('/', validate(createdUserSchema), createUser);
router.put('/:id', updateUser);
router.delete('/:id', destroyUser);

export default router;

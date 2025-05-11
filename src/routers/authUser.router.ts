import { AuthUser } from '../controllers/auth.controller.js';
import express from 'express';
import { validate } from '../middlewares/dataValidation.js';
import {
  loginValidation,
  optValidation,
  registerUserValidation,
  resendOptValidation,
} from '../yupValidation/auth.validation.js';

const authRouter = express.Router();

authRouter.post('/login', validate(loginValidation), AuthUser.login);
authRouter.post('/register', validate(registerUserValidation), AuthUser.register);
authRouter.post('/verify-opt', validate(optValidation), AuthUser.verifyOtp);
authRouter.post('/resend-opt', validate(resendOptValidation), AuthUser.resendOtp);
authRouter.post('/refresh', AuthUser.refreshToken);
authRouter.post('/logout', AuthUser.logout);

export default authRouter;

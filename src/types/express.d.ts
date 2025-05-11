import 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user: User;
      roles: string[];
    }
  }
  interface DecodedToken extends JwtPayload {
    user: User;
    roles: string[];
  }
}

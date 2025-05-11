import env from '../config/env.js';
import Utils from '../helpers/utils.js';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  // console.log('====================================');
  // console.log(authHeader);
  // console.log('====================================');
  if (!authHeader) {
    res.status(401).json(Utils.errorResponse(401, 'Not token yet'));
    return;
  }

  // eslint-disable-next-line prefer-destructuring
  const token = authHeader.split(' ')[1];

  jwt.verify(token, env.accessTokenSecretKey, (err, decoded) => {
    if (typeof decoded === 'object' && decoded.user) {
      req.user = decoded.user;
    } else {
      res.status(401).json(Utils.errorResponse(401, 'Invalid token structure'));
      return;
    }

    next();
  });
};

export default verifyJWT;

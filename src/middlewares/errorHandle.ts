import { NextFunction, Request, Response } from 'express';
import Utils from '../helpers/utils.js';

interface customError extends Error {
  statusCode: number;
}

const errorHandler = (err: customError, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'internal error 500';

  console.log(`ErrorHandler :`, err);

  res.status(statusCode).json(Utils.errorResponse(statusCode, message));
};

export default errorHandler;

import { NextFunction, Request, Response } from 'express';
import Utils from '../helpers/utils.js';

export const notFound = async (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json(Utils.errorResponse(404, 'Url not found'));
};

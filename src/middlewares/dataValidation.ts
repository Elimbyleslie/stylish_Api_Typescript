import Utils from '../helpers/utils.js';
import { AnySchema, Schema, ValidationError } from 'yup';
import { NextFunction, Request, Response } from 'express';

export const validate = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req);

    try {
      await schema.validate(
        // { ...req.body, ...req.query, ...req.files, ...req.params },
        { ...req.body, ...req.query, ...req.params },
        { strict: true, abortEarly: false },
      );
      next();
    } catch (error) {
      res
        .status(422)
        .json(Utils.errorResponse(422, 'data validation error', Utils.formatErrorValidation(error as ValidationError)));
    }
  };
};

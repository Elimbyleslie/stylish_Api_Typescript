import { AnySchema } from 'yup';
import Utils from '../helpers/utils.js';
import { KeyType, Verify } from 'node:crypto';
import { NextFunction, Request, RequestParamHandler, Response } from 'express';

export const validate = (schema: AnySchema) => {
  return async (req: Request, res: any, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(
        { ...req.body, ...req.query, ...req.params, ...req.files },
        {
          strict: true,
          abortEarly: false,
        },
      );
      next();
    } catch (error: any) {
      return res.status(422).json({
        message: 'Validation failed !!!',
        errors: Utils.formatErrorValidation(error),
      });
    }
  };
};

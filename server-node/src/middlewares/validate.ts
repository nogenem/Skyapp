import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

import handleErrors from '../utils/handleErrors';

type TReturn = Response<unknown> | void;

export default (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<TReturn> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return handleErrors(errors, res);
  };
};

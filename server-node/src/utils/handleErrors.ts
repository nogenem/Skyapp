import { Response } from 'express';
import { Result, ValidationError } from 'express-validator';
import mongoose from 'mongoose';

import {
  CustomError,
  validatorErrors,
  internalServerError,
  invalidIdError,
  mongooseErrors,
} from './errors';
import parseMongooseErrors from './parseMongooseErrors';
import parseValidatorErrors from './parseValidatorErrors';

type TError =
  | Result<ValidationError>
  | CustomError
  | mongoose.Error.CastError
  | mongoose.Error.ValidationError
  | Error;

const isMongooseObjectIdError = (err: mongoose.Error.CastError) =>
  err.kind === 'ObjectId' ||
  err.message ===
    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters';

const handleErrors = (err: TError, res: Response): Response<unknown> => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({ errors: err.msgObj });
  }

  // Erros vindos do express-validator
  if (err instanceof Result) {
    return handleErrors(validatorErrors(parseValidatorErrors(err)), res);
  }

  // Erro de cast de object id lançado pelo mongoose
  if (err instanceof mongoose.Error.CastError && isMongooseObjectIdError(err))
    return handleErrors(invalidIdError(), res);

  // Erros vindos do mongoose e referentes a campos de alguma collection
  if (err instanceof mongoose.Error.ValidationError)
    return handleErrors(mongooseErrors(parseMongooseErrors(err)), res);

  if (process.env.NODE_ENV !== 'test') console.error(err);
  return handleErrors(internalServerError(), res);
};

export default handleErrors;

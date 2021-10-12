import { Response } from 'express';
import { Result, ValidationError } from 'express-validator';
import mongoose from 'mongoose';

import i18n from '~/i18n';

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

const translateErrors = (err: CustomError) => {
  return Object.entries(err.msgObj).reduce((acc, cur) => {
    let ret;
    if (Array.isArray(cur[1])) {
      // (string | TTranslatableError)[]
      ret = cur[1].map(c => {
        if (typeof c === 'object' && c.msg)
          return i18n.t(`Errors:${c.msg}`, c.params);
        return i18n.t(`Errors:${c}`);
      });
    } else if (typeof cur[1] === 'object' && cur[1].msg) {
      // TTranslatableError
      ret = i18n.t(`Errors:${cur[1].msg}`, cur[1].params);
    } else {
      // string
      ret = i18n.t(`Errors:${cur[1]}`);
    }
    return {
      ...acc,
      ...{
        [cur[0]]: ret,
      },
    };
  }, {});
};

const handleErrors = (err: TError, res: Response): Response<unknown> => {
  if (err instanceof CustomError) {
    const errors = translateErrors(err);
    return res.status(err.status).json({ errors });
  }

  // Errors coming from `express-validator`
  if (err instanceof Result) {
    return handleErrors(validatorErrors(parseValidatorErrors(err)), res);
  }

  // Cast error coming from mongoose
  if (err instanceof mongoose.Error.CastError && isMongooseObjectIdError(err))
    return handleErrors(invalidIdError(), res);

  // Errors coming from mongoose, referring to fields in some collection
  if (err instanceof mongoose.Error.ValidationError)
    return handleErrors(mongooseErrors(parseMongooseErrors(err)), res);

  if (process.env.NODE_ENV !== 'test') console.error(err);
  return handleErrors(internalServerError(), res);
};

export default handleErrors;

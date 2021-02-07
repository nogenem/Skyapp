import { Result, ValidationError } from 'express-validator';
import forEach from 'lodash.foreach';

import { CustomError } from './errors';
import type { IMsgObj } from './errors';

export default (
  validatorResult: Result<ValidationError>,
): IMsgObj<string[]> => {
  const result: IMsgObj<string[]> = {};
  const errors = validatorResult.array();
  forEach(errors, (err: ValidationError) => {
    if (err.msg instanceof CustomError) {
      forEach(err.msg.msgObj as IMsgObj<string>, (v, k) => {
        if (!result[k]) result[k] = [];
        result[k].push(v);
      });
    } else {
      if (!result[err.param]) result[err.param] = [];
      result[err.param].push(err.msg);
    }
  });
  return result;
};

import forEach from 'lodash.foreach';
import mongoose from 'mongoose';

import type { IMsgObj } from './errors';

const patt = /fields\.\d+\.\w+/g;

export default ({
  errors,
}: mongoose.Error.ValidationError): IMsgObj<string> => {
  const result: IMsgObj<string> = {};
  forEach(errors, (val, k) => {
    let key = k;
    if (patt.test(key)) key = key.substring(key.lastIndexOf('.') + 1);
    result[key] = val.message;
  });
  return result;
};

import { Result } from 'express-validator';

import { CustomError } from '~/utils/errors';
import parseValidatorErrors from '~/utils/parseValidatorErrors';
import { setupDB } from '~t/test-setup';

describe('parseValidatorErrors', () => {
  setupDB();

  it('should return an object with the errors from the Validator', async () => {
    const errors = new Result(
      err => err,
      [{ param: 'foo', msg: 'bar', location: 'body', value: 'foo' }],
    );

    const ret = parseValidatorErrors(errors);

    expect(ret.foo).toBeTruthy();
  });

  it('should return an object with the errors from the Validator when using a CustomError', async () => {
    const errors = new Result(
      err => err,
      [
        {
          param: 'foo',
          msg: new CustomError({ global: 'test' }),
          location: 'body',
          value: 'foo',
        },
      ],
    );

    const ret = parseValidatorErrors(errors);

    expect(ret.global).toBeTruthy();
  });
});

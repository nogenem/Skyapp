import { User } from '~/models';
import type { IMsgObj } from '~/utils/errors';
import parseMongooseErrors from '~/utils/parseMongooseErrors';

import { setupDB } from '../../test-setup';

describe('parseMongooseErrors', () => {
  setupDB();

  it('should return an object with the errors from Mongoose', async () => {
    let errors: IMsgObj<string> = {};
    try {
      await User.create({});
    } catch (err) {
      errors = parseMongooseErrors(err);
    }
    expect(errors.nickname).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.passwordHash).toBeTruthy();
  });
});

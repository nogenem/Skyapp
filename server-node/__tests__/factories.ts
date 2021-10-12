import { factory } from 'factory-girl';
import faker from 'faker';

import { USER_STATUS } from '~/constants/user_status';
import { User } from '~/models';
import type { IUser } from '~/models';

factory.define('User', User, (opts: Partial<IUser> = {}): IUser => {
  const pass = opts.password || faker.internet.password();
  return {
    nickname: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: pass,

    confirmed: false,
    status: USER_STATUS.ACTIVE,
    thoughts: '',
    confirmationToken: '',
    resetPasswordToken: '',

    // virtual
    password: pass,
    passwordConfirmation: pass,
  };
});

export default factory;

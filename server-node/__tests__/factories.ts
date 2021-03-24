import { factory } from 'factory-girl';
import faker from 'faker';

import { User } from '~/models';
import type { IUser } from '~/models';

factory.define(
  'User',
  User,
  (opts: Partial<IUser> = {}): IUser => {
    const pass = opts.password || faker.internet.password();
    return {
      nickname: faker.internet.userName(),
      email: faker.internet.email(),
      password: pass, // virtual
      passwordConfirmation: pass, // virtual
      passwordHash: pass,
      confirmationToken: '',
      confirmed: false,
    };
  },
);

export default factory;

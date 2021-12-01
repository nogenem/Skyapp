import merge from 'deepmerge';
import faker from 'faker/locale/en_US';

import { USER_STATUS } from '~/constants/user_status';
import type { IUser } from '~/redux/user/types';

export default (override?: Partial<IUser>): IUser =>
  merge(
    {
      _id: faker.datatype.uuid(),
      nickname: faker.internet.userName(),
      email: faker.internet.email(),
      confirmed: Math.random() < 0.5,
      status: faker.helpers.randomize(Object.values(USER_STATUS)),
      thoughts: faker.lorem.sentence(),
      token: faker.datatype.uuid(),
    } as IUser,
    override || {},
  );

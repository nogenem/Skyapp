import merge from 'deepmerge';
import faker from 'faker/locale/en_US';

import { USER_STATUS } from '~/constants/user_status';
import type { IOtherUser } from '~/redux/chat/types';

export default (override?: Partial<IOtherUser>): IOtherUser =>
  merge(
    {
      _id: faker.datatype.uuid(),
      nickname: faker.internet.userName(),
      status: faker.helpers.randomize(Object.values(USER_STATUS)),
      thoughts: faker.lorem.sentence(),
      channel_id: Math.random() < 0.5 ? undefined : faker.datatype.uuid(),
    } as IOtherUser,
    override || {},
  );

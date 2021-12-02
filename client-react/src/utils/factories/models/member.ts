import faker from 'faker/locale/en_US';

import type { IMember } from '~/redux/chat/types';

export default (override?: Partial<IMember>): IMember =>
  ({
    user_id: faker.datatype.uuid(),
    is_adm: Math.random() < 0.5,
    last_seen: new Date(),
    ...(override || {}),
  } as IMember);

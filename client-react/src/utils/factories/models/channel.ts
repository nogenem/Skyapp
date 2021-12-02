import faker from 'faker/locale/en_US';

import type { IChannel } from '~/redux/chat/types';

import memberFactory from './member';
import messageFactory from './message';

interface IOptions {
  membersLen: number;
}

export default (
  override?: Partial<IChannel>,
  options?: Partial<IOptions>,
): IChannel => {
  const membersLen =
    options?.membersLen !== undefined && options?.membersLen !== null
      ? options?.membersLen
      : faker.datatype.number({ min: 2, max: 3 });
  const members = Array.from({ length: membersLen }, () => memberFactory({}));
  const isGroup = membersLen > 2;
  const id = faker.datatype.uuid();

  return {
    _id: id,
    name: faker.lorem.words(),
    is_group: isGroup,
    members: members,
    other_member_idx: isGroup
      ? undefined
      : faker.datatype.number({ min: 0, max: 1 }),
    unread_msgs: faker.datatype.number({ min: 0, max: 99 }),
    lastMessage:
      Math.random() < 0.5 ? undefined : messageFactory({ channel_id: id }),
    ...(override || {}),
  } as IChannel;
};

export type { IOptions };

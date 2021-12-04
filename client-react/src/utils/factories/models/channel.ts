import faker from 'faker/locale/en_US';

import type { IChannel, IMember } from '~/redux/chat/types';

import memberFactory from './member';
import messageFactory from './message';

interface IOptions {
  useConstValues: boolean;
  membersLen: number;
}

export default (
  override?: Partial<IChannel>,
  options?: Partial<IOptions>,
): IChannel => {
  let channelId = faker.datatype.uuid();
  if (options?.useConstValues) channelId = 'channel-1';

  let name = faker.lorem.words();
  if (options?.useConstValues) name = 'Channel 1';

  let membersLen = faker.datatype.number({ min: 2, max: 3 });
  if (options?.membersLen !== undefined && options.membersLen >= 0) {
    membersLen = options.membersLen;
  } else if (options?.useConstValues) {
    membersLen = 2;
  }

  let members: IMember[] = [];
  if (!options?.useConstValues) {
    members = Array.from({ length: membersLen }, () => memberFactory());
  } else {
    members = Array.from({ length: membersLen }, (_, idx) =>
      memberFactory({ user_id: `member-${idx}` }, { useConstValues: true }),
    );
  }

  const isGroup = membersLen > 2;

  let otherMemberIdx = !isGroup
    ? faker.datatype.number({ min: 0, max: 1 })
    : undefined;
  if (!isGroup && options?.useConstValues) otherMemberIdx = 1;

  let unreadMsgs = faker.datatype.number({ min: 0, max: 99 });
  if (options?.useConstValues) unreadMsgs = 2;

  let lastMessage = undefined;
  if (!options?.useConstValues) {
    lastMessage = messageFactory({ channel_id: channelId });
  } else if (options?.useConstValues) {
    lastMessage = messageFactory(
      {
        _id: 'last-message-1',
        channel_id: channelId,
      },
      { useConstValues: true },
    );
  }

  return {
    _id: channelId,
    name,
    is_group: isGroup,
    members,
    other_member_idx: otherMemberIdx,
    unread_msgs: unreadMsgs,
    lastMessage,
    ...(override || {}),
  } as IChannel;
};

export type { IOptions };

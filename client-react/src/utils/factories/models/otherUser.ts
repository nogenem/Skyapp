import faker from 'faker/locale/en_US';

import { TUserStatus, USER_STATUS } from '~/constants/user_status';
import type { IOtherUser } from '~/redux/chat/types';

interface IOptions {
  useConstValues: boolean;
}

export default (
  override?: Partial<IOtherUser>,
  options?: Partial<IOptions>,
): IOtherUser => {
  let userId = faker.datatype.uuid();
  if (options?.useConstValues) userId = 'other-user-1';

  let nickname = faker.internet.userName();
  if (options?.useConstValues) nickname = 'Nickname 1';

  let status: TUserStatus = faker.helpers.randomize(Object.values(USER_STATUS));
  if (options?.useConstValues) status = USER_STATUS.ACTIVE;

  let thoughts = faker.lorem.sentence();
  if (options?.useConstValues) thoughts = 'Some thoughts';

  let channelId: string | undefined =
    Math.random() < 0.5 ? undefined : faker.datatype.uuid();
  if (options?.useConstValues) channelId = 'channel-1';

  return {
    _id: userId,
    nickname,
    status,
    thoughts,
    channel_id: channelId,
    ...(override || {}),
  } as IOtherUser;
};

export type { IOptions };

import faker from 'faker/locale/en_US';

import { TUserStatus, USER_STATUS } from '~/constants/user_status';
import type { IUser } from '~/redux/user/types';

interface IOptions {
  useConstValues: boolean;
}

export default (
  override?: Partial<IUser>,
  options?: Partial<IOptions>,
): IUser => {
  let userId = faker.datatype.uuid();
  if (options?.useConstValues) userId = 'user-1';

  let nickname = faker.internet.userName();
  if (options?.useConstValues) nickname = 'Nickname 1';

  let email = faker.internet.email();
  if (options?.useConstValues) email = 'email@email.com';

  let confirmed = Math.random() < 0.5;
  if (options?.useConstValues) confirmed = true;

  let status: TUserStatus = faker.helpers.randomize(Object.values(USER_STATUS));
  if (options?.useConstValues) status = USER_STATUS.ACTIVE;

  let thoughts = faker.lorem.sentence();
  if (options?.useConstValues) thoughts = 'Some thoughts';

  let token = faker.datatype.uuid();
  if (options?.useConstValues) token = 'token-1';

  return {
    _id: userId,
    nickname,
    email,
    confirmed,
    status,
    thoughts,
    token,
    ...(override || {}),
  } as IUser;
};

export type { IOptions };

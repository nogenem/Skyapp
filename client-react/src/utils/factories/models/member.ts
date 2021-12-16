import faker from 'faker/locale/en_US';

import type { IMember } from '~/redux/chat/types';

interface IOptions {
  useConstValues: boolean;
}

export default (
  override?: Partial<IMember>,
  options?: Partial<IOptions>,
): IMember => {
  let userId = faker.datatype.uuid();
  if (options?.useConstValues) userId = 'member-1';

  let isAdm = Math.random() < 0.5;
  if (options?.useConstValues) isAdm = false;

  let lastSeen = new Date();
  if (options?.useConstValues) lastSeen = new Date('2021-12-04T13:33:19.037Z');

  return {
    userId,
    isAdm,
    lastSeen,
    ...(override || {}),
  } as IMember;
};

export type { IOptions };

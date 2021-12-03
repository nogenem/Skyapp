import faker from 'faker/locale/en_US';

import type { IActiveChannelInfo } from '~/redux/chat/types';

import messageFactory from './message';

interface IOptions {
  messagesLen: number;
  queueLen: number;
}

// TODO: Make all factories NOT use random values, or at least give an option for that
//    - Its quite annoying having to explicit set values for the override
//      when i'm using `toMatchSnapshot` ...
export default (
  override?: Partial<IActiveChannelInfo>,
  options?: Partial<IOptions>,
): IActiveChannelInfo => {
  const id = faker.datatype.uuid();

  const messagesLen =
    options?.messagesLen !== undefined && options?.messagesLen !== null
      ? options?.messagesLen
      : faker.datatype.number({ min: 0, max: 2 });
  const messages = Array.from({ length: messagesLen }, () =>
    messageFactory({ channel_id: id }),
  );

  const queueLen =
    options?.queueLen !== undefined && options?.queueLen !== null
      ? options?.queueLen
      : faker.datatype.number({ min: 0, max: 2 });
  const queue = Array.from({ length: queueLen }, () =>
    messageFactory({ channel_id: id }),
  );

  return {
    _id: id,
    messages,
    totalMessages: messagesLen,
    queue,
    ...(override || {}),
  } as IActiveChannelInfo;
};

export type { IOptions };

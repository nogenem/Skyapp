import merge from 'deepmerge';
import faker from 'faker/locale/en_US';

import type { IActiveChannelInfo } from '~/redux/chat/types';

import messageFactory from './message';

interface IOptions {
  messagesLen: number;
  queueLen: number;
}

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

  return merge(
    {
      _id: id,
      messages,
      totalMessages: messagesLen,
      queue,
    } as IActiveChannelInfo,
    override || {},
  );
};

export type { IOptions };

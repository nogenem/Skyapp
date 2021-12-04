import faker from 'faker/locale/en_US';

import { MESSAGE_TYPES } from '~/constants/message_types';
import type { IActiveChannelInfo, IMessage } from '~/redux/chat/types';

import messageFactory from './message';

interface IOptions {
  useConstValues: boolean;
  messagesLen: number;
  queueLen: number;
}

export default (
  override?: Partial<IActiveChannelInfo>,
  options?: Partial<IOptions>,
): IActiveChannelInfo => {
  let channelId = faker.datatype.uuid();
  if (options?.useConstValues) channelId = 'channel-1';

  let messagesLen = faker.datatype.number({ min: 0, max: 2 });
  if (options?.messagesLen !== undefined && options.messagesLen >= 0) {
    messagesLen = options.messagesLen;
  } else if (!!options?.useConstValues) {
    messagesLen = 2;
  }

  let messages: IMessage[] = [];
  if (!options?.useConstValues) {
    messages = Array.from({ length: messagesLen }, () =>
      messageFactory({ channel_id: channelId }),
    );
  } else {
    messages = Array.from({ length: messagesLen }, (_, idx) =>
      messageFactory(
        {
          _id: `message-${idx}`,
          channel_id: channelId,
          body: `Test Message ${idx}`,
          type: MESSAGE_TYPES.TEXT,
        },
        { useConstValues: true },
      ),
    );
  }

  let queueLen = faker.datatype.number({ min: 0, max: 2 });
  if (options?.queueLen !== undefined && options.queueLen >= 0) {
    queueLen = options.queueLen;
  } else if (!!options?.useConstValues) {
    queueLen = 1;
  }

  let queue: IMessage[] = [];
  if (!options?.useConstValues) {
    queue = Array.from({ length: queueLen }, () =>
      messageFactory({ channel_id: channelId }),
    );
  } else {
    queue = Array.from({ length: queueLen }, (_, idx) =>
      messageFactory(
        {
          _id: `queue-${idx}`,
          channel_id: channelId,
          body: `Queue Message ${idx}`,
          type: MESSAGE_TYPES.TEXT,
        },
        { useConstValues: true },
      ),
    );
  }

  return {
    _id: channelId,
    messages,
    totalMessages: messagesLen,
    queue,
    ...(override || {}),
  } as IActiveChannelInfo;
};

export type { IOptions };

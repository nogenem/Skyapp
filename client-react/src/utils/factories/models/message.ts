import faker from 'faker/locale/en_US';

import { MESSAGE_TYPES } from '~/constants/message_types';
import type { IAttachment, IMessage } from '~/redux/chat/types';

import attachmentFactory from './attachment';

interface IOptions {
  useConstValues: boolean;
}

export default (
  override?: Partial<IMessage>,
  options?: Partial<IOptions>,
): IMessage => {
  let messageId = faker.datatype.uuid();
  if (options?.useConstValues) messageId = 'message-1';

  let channelId = faker.datatype.uuid();
  if (options?.useConstValues) channelId = 'channel-1';

  let fromId = Math.random() < 0.2 ? undefined : faker.datatype.uuid();
  if (options?.useConstValues) fromId = undefined;

  let isTextMessage = Math.random() < 0.5;
  if (options?.useConstValues) isTextMessage = true;

  const messageType = isTextMessage
    ? MESSAGE_TYPES.TEXT
    : MESSAGE_TYPES.UPLOADED_FILE;

  let body: string | IAttachment = '';
  if (isTextMessage) {
    if (!options?.useConstValues) body = faker.lorem.paragraph();
    else body = 'Test message 1';
  } else {
    if (!options?.useConstValues) body = attachmentFactory();
    else body = attachmentFactory({}, { useConstValues: true });
  }

  let createdAt = new Date();
  if (options?.useConstValues) createdAt = new Date('2021-12-04T13:33:19.037Z');

  let updatedAt = new Date();
  if (options?.useConstValues) updatedAt = new Date('2021-12-04T13:33:19.037Z');

  let isUpdating = Math.random() < 0.2;
  if (options?.useConstValues) isUpdating = false;

  let isDeleting = !isUpdating ? Math.random() < 0.2 : false;
  if (options?.useConstValues) isDeleting = false;

  return {
    _id: messageId,
    channelId,
    fromId,
    body,
    type: messageType,
    createdAt,
    updatedAt,
    isUpdating,
    isDeleting,
    ...(override || {}),
  } as IMessage;
};

export type { IOptions };

import faker from 'faker/locale/en_US';

import { MESSAGE_TYPES } from '~/constants/message_types';
import type { IMessage } from '~/redux/chat/types';

import attachmentFactory from './attachment';

export default (override?: Partial<IMessage>): IMessage => {
  const isTextMessage = Math.random() < 0.5;
  const messageType = isTextMessage
    ? MESSAGE_TYPES.TEXT
    : MESSAGE_TYPES.UPLOADED_FILE;
  const isUpdating = Math.random() < 0.2;
  let isDeleting = false;
  if (!isUpdating) isDeleting = Math.random() < 0.2;

  return {
    _id: faker.datatype.uuid(),
    channel_id: faker.datatype.uuid(),
    from_id: Math.random() < 0.2 ? undefined : faker.datatype.uuid(),
    body: isTextMessage ? faker.lorem.paragraph() : attachmentFactory({}),
    type: messageType,
    createdAt: new Date(),
    updatedAt: new Date(),
    isUpdating,
    isDeleting,
    ...(override || {}),
  } as IMessage;
};

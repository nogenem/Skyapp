import { IO_MESSAGES_RECEIVED } from '~/constants/socket_events';

import type { TEmitterFunc, IMessagesReceived } from './types';

const messagesReceived: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_MESSAGES_RECEIVED;
  const { channel, messages } = eventData as IMessagesReceived;

  channel.members.forEach(member => {
    const thisMemberClient = clients[member.user_id];
    if (thisMemberClient) {
      io.to(thisMemberClient.socketId).emit(event, messages);
    }
  });
};

export default messagesReceived;

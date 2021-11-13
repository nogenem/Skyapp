import { IO_MESSAGES_RECEIVED } from '~/constants/socket_events';

import type { TEmitterFunc, IMessagesReceived } from './types';

const messagesReceived: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_MESSAGES_RECEIVED;
  const { channel, messages } = eventData as IMessagesReceived;
  const fromId = messages[0].from_id;

  channel.members.forEach(member => {
    const thisMemberClient = clients[member.user_id];
    if (thisMemberClient && (!fromId || fromId !== member.user_id)) {
      io.to(thisMemberClient.socketId).emit(event, messages);
    }
  });
};

export default messagesReceived;

import { IO_MESSAGE_DELETED } from '~/constants/socket_events';

import type { TEmitterFunc, IMessageRemoved } from './types';

const messageDeleted: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_MESSAGE_DELETED;
  const { channel, message, lastMessage } = eventData as IMessageRemoved;
  const { fromId } = message;

  channel.members.forEach(member => {
    const thisMemberClient = clients[member.userId];
    if (thisMemberClient && (!fromId || fromId !== member.userId)) {
      io.to(thisMemberClient.socketId).emit(event, { message, lastMessage });
    }
  });
};

export default messageDeleted;

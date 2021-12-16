import { IO_MESSAGE_EDITED } from '~/constants/socket_events';

import type { TEmitterFunc, IMessageEdited } from './types';

const messageEdited: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_MESSAGE_EDITED;
  const { channel, message } = eventData as IMessageEdited;
  const { fromId } = message;

  channel.members.forEach(member => {
    const thisMemberClient = clients[member.userId];
    if (thisMemberClient && (!fromId || fromId !== member.userId)) {
      io.to(thisMemberClient.socketId).emit(event, message);
    }
  });
};

export default messageEdited;

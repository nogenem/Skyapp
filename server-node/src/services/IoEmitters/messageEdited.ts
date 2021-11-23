import { IO_MESSAGE_EDITED } from '~/constants/socket_events';

import type { TEmitterFunc, IMessageEdited } from './types';

const messageEdited: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_MESSAGE_EDITED;
  const { channel, message } = eventData as IMessageEdited;
  const fromId = message.from_id;

  channel.members.forEach(member => {
    const thisMemberClient = clients[member.user_id];
    if (thisMemberClient && (!fromId || fromId !== member.user_id)) {
      io.to(thisMemberClient.socketId).emit(event, message);
    }
  });
};

export default messageEdited;

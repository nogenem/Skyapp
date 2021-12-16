import { IO_SET_LAST_SEEN } from '~/constants/socket_events';

import type { ISetLastSeen, TEmitterFunc } from './types';

const setLastSeen: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_SET_LAST_SEEN;
  const { channel, currentUserId, lastSeen } = eventData as ISetLastSeen;
  const data = {
    channelId: channel._id,
    userId: currentUserId,
    lastSeen,
  };

  if (!channel.isGroup) {
    channel.members.forEach(member => {
      const thisMemberClient = clients[member.userId];
      if (thisMemberClient) {
        io.to(thisMemberClient.socketId).emit(event, data);
      }
    });
  }
};

export default setLastSeen;

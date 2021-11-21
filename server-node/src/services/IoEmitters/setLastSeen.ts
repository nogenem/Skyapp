import { IO_SET_LAST_SEEN } from '~/constants/socket_events';

import type { ISetLastSeen, TEmitterFunc } from './types';

const setLastSeen: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_SET_LAST_SEEN;
  const { channel, currentUserId, lastSeen } = eventData as ISetLastSeen;
  const data = {
    channel_id: channel._id,
    user_id: currentUserId,
    last_seen: lastSeen,
  };

  if (!channel.is_group) {
    channel.members.forEach(member => {
      const thisMemberClient = clients[member.user_id];
      if (thisMemberClient) {
        io.to(thisMemberClient.socketId).emit(event, data);
      }
    });
  }
};

export default setLastSeen;

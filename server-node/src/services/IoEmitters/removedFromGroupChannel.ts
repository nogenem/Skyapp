import { IO_REMOVED_FROM_GROUP_CHANNEL } from '~/constants/socket_events';

import type { TEmitterFunc, IRemovedFromGroupChannel } from './types';

const removedFromGroupChannel: TEmitterFunc = async (
  io,
  clients,
  eventData,
) => {
  const event = IO_REMOVED_FROM_GROUP_CHANNEL;
  const { channel, members } = eventData as IRemovedFromGroupChannel;

  members.forEach(id => {
    const thisMemberClient = clients[id];
    if (thisMemberClient) {
      io.to(thisMemberClient.socketId).emit(event, {
        channelId: channel._id,
      });
    }
  });
};

export default removedFromGroupChannel;

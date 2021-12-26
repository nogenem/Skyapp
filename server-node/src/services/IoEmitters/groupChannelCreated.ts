import { IO_GROUP_CHANNEL_CREATED } from '~/constants/socket_events';
import type { IChatChannel } from '~/models';

import type { TEmitterFunc } from './types';

const groupChannelCreated: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_GROUP_CHANNEL_CREATED;
  const channelJson = eventData as IChatChannel;

  channelJson.members.forEach(member => {
    const thisMemberClient = clients[member.userId];
    if (thisMemberClient) {
      io.to(thisMemberClient.socketId).emit(event, channelJson);
    }
  });
};

export default groupChannelCreated;

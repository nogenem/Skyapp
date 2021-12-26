import { IO_GROUP_CHANNEL_UPDATED } from '~/constants/socket_events';
import { Message } from '~/models';
import type { IChatChannel } from '~/models';

import type { TEmitterFunc } from './types';

const groupChannelUpdated: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_GROUP_CHANNEL_UPDATED;
  const channelJson = eventData as IChatChannel;

  const promises = channelJson.members.map(async member => {
    const thisMemberClient = clients[member.userId];
    if (thisMemberClient) {
      const unreadMsgs = await Message.countDocuments({
        channelId: channelJson._id,
        updatedAt: { $gt: member.lastSeen },
      });
      channelJson.unreadMsgs = unreadMsgs;

      io.to(thisMemberClient.socketId).emit(event, channelJson);
    }
  });

  await Promise.all(promises);
};

export default groupChannelUpdated;

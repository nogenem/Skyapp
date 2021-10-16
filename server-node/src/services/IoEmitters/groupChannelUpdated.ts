import { IO_GROUP_CHANNEL_UPDATED } from '~/constants/socket_events';
import { IChatChannel, Message } from '~/models';

import type { TEmitterFunc } from './types';

const groupChannelUpdated: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_GROUP_CHANNEL_UPDATED;
  const channelJson = eventData as IChatChannel;

  const promises = channelJson.members.map(async member => {
    const thisMemberClient = clients[member.user_id];
    if (thisMemberClient) {
      const unreadMsgs = await Message.countDocuments({
        channel_id: channelJson._id,
        updatedAt: { $gt: member.last_seen },
      });
      channelJson.unread_msgs = unreadMsgs;

      io.to(thisMemberClient.socketId).emit(event, channelJson);
    }
  });

  await Promise.all(promises);
};

export default groupChannelUpdated;

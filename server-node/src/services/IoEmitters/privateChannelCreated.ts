import { IO_PRIVATE_CHANNEL_CREATED } from '~/constants/socket_events';
import { IChatChannel } from '~/models';

import type { TEmitterFunc } from './types';

const privateChannelCreated: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_PRIVATE_CHANNEL_CREATED;
  const channelJson = eventData as IChatChannel;

  channelJson.members.forEach((member, idx) => {
    const otherMemberIdx = idx === 0 ? 1 : 0;
    const thisMemberClient = clients[member.user_id];

    if (thisMemberClient) {
      io.to(thisMemberClient.socketId).emit(event, {
        ...channelJson,
        other_member_idx: otherMemberIdx,
      });
    }
  });
};

export default privateChannelCreated;

import mongoose from 'mongoose';

import { User, Message, Channel, IUserDoc } from '~/models';
import type { IChatUser, IChatChannel } from '~/models';
import { IClientMap } from '~/typescript-declarations/io.d';

interface IChatUsers {
  [_id: string]: IChatUser;
}

interface IChatChannels {
  [_id: string]: IChatChannel;
}

interface IInitialData {
  users: IChatUsers;
  channels: IChatChannels;
}

export default async (
  currentUserId: string,
  currentClients: IClientMap,
): Promise<IInitialData> => {
  const objectId = mongoose.Types.ObjectId;

  // Get Channels data together with the last message
  // sent in them (lastMessage)
  const aggregate = Channel.aggregate<IChatChannel>([
    {
      $match: {
        'members.user_id': objectId(currentUserId),
      },
    },
    {
      $lookup: {
        // join
        from: 'messages',
        let: {
          channels_id: '$_id', // Channel._id
        },
        pipeline: [
          {
            $match: {
              // Message.channel_id === Channel._id
              $expr: { $eq: ['$channel_id', '$$channels_id'] },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              channel_id: 1,
              from_id: 1,
              body: 1,
              type: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        as: 'messages',
      },
    },
    {
      $project: {
        name: 1,
        is_group: 1,
        members: 1,
        lastMessage: { $arrayElemAt: ['$messages', 0] },
      },
    },
  ]);

  const p1 = aggregate.exec();
  const p2 = User.find(
    { _id: { $ne: objectId(currentUserId) }, confirmed: true },
    '_id nickname thoughts status',
  );

  const [tmpChannels, tmpUsers]: [IChatChannel[], IUserDoc[]] =
    await Promise.all([p1, p2]);

  // Get the amount of unread messages by the currentUserId in each Channel
  const promises = tmpChannels.map(c => {
    const member = c.members.find(m => m.user_id.toString() === currentUserId);

    if (!member) return 0;
    return Message.countDocuments({
      channel_id: c._id,
      updatedAt: { $gt: member.last_seen },
    });
  });

  const tmpUnread = await Promise.all(promises);
  const userId2channelId: { [_id: string]: string } = {};

  const channels: IChatChannels = {};
  const users: IChatUsers = {};

  for (let i = 0; i < tmpChannels.length; i += 1) {
    // Promise.all returns the results in order
    const channel = Channel.toChatChannel(tmpChannels[i]);
    if (channel) {
      channel.unread_msgs = tmpUnread[i];

      if (!channel.is_group) {
        const otherMember = channel.members.find(
          m => m.user_id !== currentUserId,
        );
        channel.other_member_idx = channel.members[0] === otherMember ? 0 : 1;

        if (otherMember) {
          userId2channelId[otherMember.user_id] = channel._id;
        }
      }
      channels[channel._id] = channel;
    }
  }

  for (let i = 0; i < tmpUsers.length; i += 1) {
    const user = tmpUsers[i].toChatUser();
    user.online = !!currentClients[user._id];
    if (userId2channelId[user._id]) {
      const channelId = userId2channelId[user._id];
      user.channel_id = channelId;
      channels[channelId].name = user.nickname;
    }
    users[user._id] = user;
  }

  return {
    users,
    channels,
  };
};

export type { IChatUsers, IChatChannels, IInitialData };

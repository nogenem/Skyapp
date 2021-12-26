import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { selectUserId } from '../user/selectors';
import { initialState } from './reducer';
import type { IOtherUser, IChannel } from './types';

export const selectChat = (state: IAppState) => state.chat || initialState;

export const selectChatUsers = createSelector(selectChat, data => data.users);

export const selectChatChannels = createSelector(
  selectChat,
  data => data.channels,
);

export const selectChannelFromProps = (
  state: IAppState,
  { channel }: { channel: IChannel },
) => channel || {};

export const selectFilterFromProps = (
  state: IAppState,
  { filter }: { filter: string },
) => filter || '';

export const selectChannelIdFromProps = (
  state: IAppState,
  { channelId }: { channelId: string },
) => channelId || '';

export const selectChatUsersList = createSelector(selectChat, data => {
  const users = Object.values(data.users);
  users.sort((a, b) => a.nickname.localeCompare(b.nickname));
  return users;
});

export const selectChatChannelsList = createSelector(selectChat, data => {
  const channels = Object.values(data.channels);
  channels.sort((a, b) => a.name.localeCompare(b.name));
  channels.sort((a, b) => {
    if (!!a.lastMessage && !!b.lastMessage) {
      return (
        b.lastMessage.updatedAt.getTime() - a.lastMessage.updatedAt.getTime()
      );
    } else if (!!a.lastMessage && !b.lastMessage) {
      return -1;
    } else if (!!b.lastMessage && !a.lastMessage) {
      return 1;
    } else {
      return 0;
    }
  });
  return channels;
});

export const selectFilteredChatChannelsList = createSelector(
  [selectChatChannelsList, selectFilterFromProps],
  (channelsList, filter) => {
    if (!filter) return channelsList;
    filter = filter.toLowerCase();
    return channelsList.filter(channel =>
      channel.name.toLowerCase().includes(filter),
    );
  },
);

export const selectFilteredChatChannelsIdsList = createSelector(
  selectFilteredChatChannelsList,
  channels => channels.map(channel => channel._id),
);

export const selectChatChannelById = createSelector(
  [selectChatChannels, selectChannelIdFromProps],
  (channels, channelId) => channels[channelId] as IChannel | undefined,
);

export const selectChatUsersWithoutChannelList = createSelector(
  selectChat,
  data => {
    const users = Object.values(data.users).filter(user => !user.channelId);
    users.sort((a, b) => a.nickname.localeCompare(b.nickname));
    return users;
  },
);

export const selectActiveChannelInfo = createSelector(
  selectChat,
  data => data.activeChannelInfo,
);

export const selectActiveChannelId = createSelector(
  selectChat,
  data => data.activeChannelInfo?._id,
);

export const selectActiveChannel = createSelector(
  selectChat,
  data =>
    data.channels[data.activeChannelInfo?._id || ''] as IChannel | undefined,
);

export const selectActiveChannelLastMessage = createSelector(
  selectActiveChannel,
  activeChannel => activeChannel?.lastMessage,
);

export const selectActiveChannelIsGroup = createSelector(
  selectActiveChannel,
  activeChannel => activeChannel?.isGroup,
);

export const selectActiveChannelMessages = createSelector(
  selectChat,
  data => data.activeChannelInfo?.messages,
);

export const selectActiveChannelMessagesQueue = createSelector(
  selectChat,
  data => data.activeChannelInfo?.queue,
);

export const selectActiveChannelTotalMessages = createSelector(
  selectChat,
  data => data.activeChannelInfo?.totalMessages,
);

export const selectOtherUserFromChannel = createSelector(
  [selectChat, selectChatChannelById],
  (data, channel) => {
    if (!!channel && !channel.isGroup) {
      return data.users[channel.members[channel.otherMemberIdx || 0].userId];
    }
    return undefined;
  },
);

export const selectOtherUsersFromActiveChannel = createSelector(
  [selectChat, selectActiveChannel, selectUserId],
  (data, channel, loggedUserId) => {
    const users: IOtherUser[] = [];
    if (channel) {
      channel.members.forEach(member => {
        if (member.userId !== loggedUserId) {
          users.push(data.users[member.userId]);
        }
      });
    }
    return users;
  },
);

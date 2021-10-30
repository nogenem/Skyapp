import produce from 'immer';
import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EUserActions } from '../user/types';
import type { TUserAction } from '../user/types';
import { EChatActions } from './types';
import type { TChatAction, TChatState, IChannel, IChannels } from './types';

export const initialState: TChatState = {
  users: {},
  channels: {},
  activeChannelInfo: undefined,
};

export default function chat(
  state = initialState,
  action: TChatAction | TUserAction,
): TChatState {
  return produce(state, draft => {
    switch (action.type) {
      case EUserActions.SIGNED_OUT: {
        return initialState;
      }
      case EChatActions.SET_INITIAL_DATA: {
        draft.users = action.payload.users;
        draft.channels = wrapChannelsDates(action.payload.channels);
        return draft;
      }
      case EChatActions.SET_USER_ONLINE: {
        if (draft.users[action.payload._id]) {
          draft.users[action.payload._id].online = action.payload.value;
        }
        return draft;
      }
      case EChatActions.ADD_OR_UPDATE_CHANNEL: {
        draft.channels[action.payload._id] = wrapChannelDates(action.payload);
        if (!action.payload.is_group) {
          const otherMemberIdx = action.payload.other_member_idx as number;
          const otherMember =
            draft.users[action.payload.members[otherMemberIdx].user_id];

          draft.channels[action.payload._id].name = otherMember.nickname;

          action.payload.members.forEach(member => {
            if (draft.users[member.user_id]) {
              draft.users[member.user_id].channel_id = action.payload._id;
            }
          });
        }
        return draft;
      }
      case EChatActions.SET_ACTIVE_CHANNEL: {
        if (
          draft.channels[action.payload._id] &&
          draft.activeChannelInfo?._id !== action.payload._id
        ) {
          draft.activeChannelInfo = {
            _id: action.payload._id,
            messages: [],
            totalMessages: 0,
          };
        }
        return draft;
      }
      case EChatActions.REMOVE_CHANNEL: {
        if (!!draft.channels[action.payload.channelId]) {
          if (
            !!draft.activeChannelInfo &&
            draft.activeChannelInfo._id === action.payload.channelId
          ) {
            draft.activeChannelInfo = undefined;
          }
          delete draft.channels[action.payload.channelId];
        }
        return draft;
      }
      case EChatActions.ADD_NEW_USER: {
        draft.users[action.payload._id] = action.payload;
        return draft;
      }
      case EChatActions.ADD_MESSAGES: {
        const { messages, totalMessages, atTop } = action.payload;
        for (let i = 0; i < messages.length; i++) {
          messages[i].createdAt = new Date(messages[i].createdAt);
          messages[i].updatedAt = new Date(messages[i].updatedAt);
        }

        const channelId = !!messages.length ? messages[0].channel_id : '';
        if (
          !!channelId &&
          !!draft.activeChannelInfo &&
          draft.activeChannelInfo._id === channelId
        ) {
          if (atTop) {
            draft.activeChannelInfo.messages = [
              ...messages,
              ...draft.activeChannelInfo.messages,
            ];
          } else {
            draft.activeChannelInfo.messages = [
              ...draft.activeChannelInfo.messages,
              ...messages,
            ];
          }
          if (totalMessages >= 0)
            draft.activeChannelInfo.totalMessages = totalMessages;
          else draft.activeChannelInfo.totalMessages += messages.length;
        }
        return draft;
      }
      case EChatActions.SET_LATEST_MESSAGE: {
        const message = { ...action.payload };
        message.createdAt = new Date(message.createdAt);
        message.updatedAt = new Date(message.updatedAt);

        const channelId = message.channel_id;
        draft.channels[channelId].lastMessage = message;
        if (
          !draft.activeChannelInfo ||
          draft.activeChannelInfo._id !== channelId
        ) {
          draft.channels[channelId].unread_msgs += 1;
        }

        return draft;
      }
      default:
        return draft;
    }
  });
}

const wrapChannelsDates = (channels: IChannels) => {
  const ret = {} as IChannels;

  Object.entries(channels).forEach(([id, channel]) => {
    wrapChannelDates(channel);
    ret[id] = channel;
  });

  return ret;
};

const wrapChannelDates = (channel: IChannel) => {
  if (channel.lastMessage) {
    channel.lastMessage.createdAt = new Date(channel.lastMessage.createdAt);
    channel.lastMessage.updatedAt = new Date(channel.lastMessage.updatedAt);
  }
  return channel;
};

// SELECTORS
export const getChat = (state: IAppState) => state.chat || initialState;
export const getUsers = createSelector(getChat, data => data.users);
export const getChannels = createSelector(getChat, data => data.channels);
export const getChannelFromProps = (
  state: IAppState,
  { channel }: { channel: IChannel },
) => channel || {};

export const getUsersArray = createSelector(getChat, data => {
  const users = Object.values(data.users);
  users.sort((a, b) => a.nickname.localeCompare(b.nickname));
  return users;
});
export const getChannelsList = createSelector(getChat, data => {
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
export const getUsersWithoutChannelArray = createSelector(getChat, data => {
  const users = Object.values(data.users).filter(user => !user.channel_id);
  users.sort((a, b) => a.nickname.localeCompare(b.nickname));
  return users;
});
export const getActiveChannelId = createSelector(
  getChat,
  data => data.activeChannelInfo?._id,
);
export const getActiveChannel = createSelector(
  getChat,
  data =>
    data.channels[data.activeChannelInfo?._id || ''] as IChannel | undefined,
);
export const getActiveChannelMessages = createSelector(
  getChat,
  data => data.activeChannelInfo?.messages,
);
export const getOtherUserFromChannel = createSelector(
  [getChat, getChannelFromProps],
  (data, channel) => {
    if (!channel.is_group) {
      return data.users[channel.members[channel.other_member_idx || 0].user_id];
    }
    return undefined;
  },
);

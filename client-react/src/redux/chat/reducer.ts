import produce from 'immer';
import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { getId as getLoggedUserId } from '../user/reducer';
import { EUserActions } from '../user/types';
import type { TUserAction } from '../user/types';
import { EChatActions, IOtherUser } from './types';
import type { TChatAction, TChatState, IChannel, IChannels } from './types';

export const initialState: TChatState = {
  users: {},
  channels: {},
  activeChannelInfo: undefined,
};

const chat = (
  state = initialState,
  action: TChatAction | TUserAction,
): TChatState =>
  produce(state, draft => {
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
        if (action.payload._id === undefined) {
          draft.activeChannelInfo = undefined;
        } else if (
          draft.channels[action.payload._id] &&
          draft.activeChannelInfo?._id !== action.payload._id
        ) {
          draft.activeChannelInfo = {
            _id: action.payload._id,
            messages: [],
            totalMessages: 0,
            queue: [],
          };
          draft.channels[action.payload._id].unread_msgs = 0;
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
        const channelId = !!messages.length ? messages[0].channel_id : '';

        for (let i = 0; i < messages.length; i++) {
          if (!(messages[i].createdAt instanceof Date))
            messages[i].createdAt = new Date(messages[i].createdAt);
          if (!(messages[i].updatedAt instanceof Date))
            messages[i].updatedAt = new Date(messages[i].updatedAt);
        }

        if (!!channelId) {
          if (
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
          } else {
            draft.channels[channelId].unread_msgs += 1;
          }
          draft.channels[channelId].lastMessage = messages[messages.length - 1];
        }
        return draft;
      }
      case EChatActions.ADD_TO_MESSAGES_QUEUE: {
        if (
          draft.activeChannelInfo &&
          draft.activeChannelInfo._id === action.payload.channel_id
        ) {
          draft.activeChannelInfo.queue.push(action.payload);
        }
        return draft;
      }
      case EChatActions.REMOVE_FROM_MESSAGES_QUEUE: {
        if (
          draft.activeChannelInfo &&
          draft.activeChannelInfo._id === action.payload.channel_id
        ) {
          draft.activeChannelInfo.queue = draft.activeChannelInfo.queue.filter(
            message => message._id !== action.payload._id,
          );
        }
        return draft;
      }
      case EChatActions.SET_LAST_SEEN: {
        const channel = draft.channels[action.payload.channel_id];
        channel.members.forEach(member => {
          if (member.user_id === action.payload.user_id) {
            member.last_seen = new Date(action.payload.last_seen);
          }
        });
        return draft;
      }
      case EChatActions.SET_USER_STATUS: {
        if (draft.users[action.payload.user_id]) {
          draft.users[action.payload.user_id].status = action.payload.newStatus;
        }
        return draft;
      }
      case EChatActions.SET_USER_THOUGHTS: {
        if (draft.users[action.payload.user_id]) {
          draft.users[action.payload.user_id].thoughts =
            action.payload.newThoughts;
        }
        return draft;
      }
      case EChatActions.SET_MESSAGE_IS_UPDATING: {
        if (draft.activeChannelInfo) {
          const message = draft.activeChannelInfo.messages.find(
            msg => msg._id === action.payload.message_id,
          );

          if (message) {
            message.isUpdating = action.payload.value;
          }
        }
        return draft;
      }
      case EChatActions.UPDATE_MESSAGE: {
        const newMessage = { ...action.payload };
        if (!(newMessage.createdAt instanceof Date))
          newMessage.createdAt = new Date(newMessage.createdAt);
        if (!(newMessage.updatedAt instanceof Date))
          newMessage.updatedAt = new Date(newMessage.updatedAt);

        if (draft.activeChannelInfo) {
          for (let i = 0; i < draft.activeChannelInfo.messages.length; i++) {
            if (draft.activeChannelInfo.messages[i]._id === newMessage._id) {
              draft.activeChannelInfo.messages[i] = newMessage;
              break;
            }
          }
        }

        if (
          draft.channels[newMessage.channel_id] &&
          draft.channels[newMessage.channel_id].lastMessage?._id ===
            newMessage._id
        ) {
          draft.channels[newMessage.channel_id].lastMessage = newMessage;
        }
        return draft;
      }
      case EChatActions.SET_MESSAGE_IS_DELETING: {
        if (draft.activeChannelInfo) {
          const message = draft.activeChannelInfo.messages.find(
            msg => msg._id === action.payload.message_id,
          );

          if (message) {
            message.isDeleting = action.payload.value;
          }
        }
        return draft;
      }
      case EChatActions.DELETE_MESSAGE: {
        if (draft.activeChannelInfo) {
          draft.activeChannelInfo.messages =
            draft.activeChannelInfo.messages.filter(
              message => message._id !== action.payload.message._id,
            );
        }

        let lastMessage = action.payload.lastMessage;
        if (!!lastMessage) {
          if (!(lastMessage.createdAt instanceof Date))
            lastMessage.createdAt = new Date(lastMessage.createdAt);
          if (!(lastMessage.updatedAt instanceof Date))
            lastMessage.updatedAt = new Date(lastMessage.updatedAt);
        }
        draft.channels[action.payload.message.channel_id].lastMessage =
          lastMessage;

        return draft;
      }
      default:
        return draft;
    }
  });

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
  channel.members.forEach(member => {
    member.last_seen = new Date(member.last_seen);
  });
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
export const getActiveChannelInfo = createSelector(
  getChat,
  data => data.activeChannelInfo,
);
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
export const getMessagesQueue = createSelector(
  getChat,
  data => data.activeChannelInfo?.queue,
);
export const getActiveChannelTotalMessages = createSelector(
  getChat,
  data => data.activeChannelInfo?.totalMessages,
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
export const getOtherUsersFromActiveChannel = createSelector(
  [getChat, getActiveChannel, getLoggedUserId],
  (data, channel, loggedUserId) => {
    const users: IOtherUser[] = [];
    if (channel) {
      channel.members.forEach(member => {
        if (member.user_id !== loggedUserId) {
          users.push(data.users[member.user_id]);
        }
      });
    }
    return users;
  },
);

export default chat;

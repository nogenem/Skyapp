import produce from 'immer';

import { EUserActions } from '../user/types';
import type { TUserAction } from '../user/types';
import { EChatActions, IMessage } from './types';
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
      case EChatActions.INITIAL_DATA_LOADED: {
        draft.users = action.payload.users;
        draft.channels = wrapChannelsDates(action.payload.channels);
        draft.activeChannelInfo = undefined;
        return draft;
      }
      case EChatActions.USER_ONLINE_STATUS_CHANGED: {
        if (draft.users[action.payload._id]) {
          draft.users[action.payload._id].online = action.payload.value;
        }
        return draft;
      }
      case EChatActions.CHANNEL_CREATED_OR_UPDATED: {
        draft.channels[action.payload._id] = wrapChannelDates(action.payload);
        if (!action.payload.isGroup) {
          const otherMemberIdx = action.payload.otherMemberIdx as number;
          const otherMember =
            draft.users[action.payload.members[otherMemberIdx].userId];

          draft.channels[action.payload._id].name = otherMember.nickname;

          action.payload.members.forEach(member => {
            if (draft.users[member.userId]) {
              draft.users[member.userId].channelId = action.payload._id;
            }
          });
        }
        return draft;
      }
      case EChatActions.ACTIVE_CHANNEL_CHANGED: {
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
          draft.channels[action.payload._id].unreadMsgs = 0;
        }
        return draft;
      }
      case EChatActions.REMOVED_FROM_CHANNEL: {
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
      case EChatActions.NEW_USER_CONFIRMED: {
        draft.users[action.payload._id] = action.payload;
        return draft;
      }
      case EChatActions.NEW_MESSAGES_RECEIVED: {
        const { messages, totalMessages, atTop } = action.payload;
        const channelId = !!messages.length ? messages[0].channelId : '';

        wrapMessagesDates(messages);

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

            draft.channels[channelId].lastMessage =
              draft.activeChannelInfo.messages[
                draft.activeChannelInfo.messages.length - 1
              ];
          } else {
            draft.channels[channelId].unreadMsgs += 1;
            draft.channels[channelId].lastMessage =
              messages[messages.length - 1];
          }
        }
        return draft;
      }
      case EChatActions.MESSAGE_ENQUEUED: {
        if (
          draft.activeChannelInfo &&
          draft.activeChannelInfo._id === action.payload.channelId
        ) {
          draft.activeChannelInfo.queue.push(action.payload);
        }
        return draft;
      }
      case EChatActions.MESSAGE_DEQUEUED: {
        if (
          draft.activeChannelInfo &&
          draft.activeChannelInfo._id === action.payload.channelId
        ) {
          draft.activeChannelInfo.queue = draft.activeChannelInfo.queue.filter(
            message => message._id !== action.payload._id,
          );
        }
        return draft;
      }
      case EChatActions.LAST_SEEN_CHANGED: {
        const channel = draft.channels[action.payload.channelId];
        channel.members.forEach(member => {
          if (member.userId === action.payload.userId) {
            member.lastSeen = new Date(action.payload.lastSeen);
          }
        });
        return draft;
      }
      case EChatActions.USER_STATUS_CHANGED: {
        if (draft.users[action.payload.userId]) {
          draft.users[action.payload.userId].status = action.payload.newStatus;
        }
        return draft;
      }
      case EChatActions.USER_THOUGHTS_CHANGED: {
        if (draft.users[action.payload.userId]) {
          draft.users[action.payload.userId].thoughts =
            action.payload.newThoughts;
        }
        return draft;
      }
      case EChatActions.MESSAGE_IS_UPDATING_CHANGED: {
        if (draft.activeChannelInfo) {
          const message = draft.activeChannelInfo.messages.find(
            msg => msg._id === action.payload.messageId,
          );

          if (message) {
            message.isUpdating = action.payload.value;
          }
        }
        return draft;
      }
      case EChatActions.MESSAGE_UPDATED: {
        const newMessage = { ...action.payload };
        wrapMessageDates(newMessage);

        if (draft.activeChannelInfo) {
          for (let i = 0; i < draft.activeChannelInfo.messages.length; i++) {
            if (draft.activeChannelInfo.messages[i]._id === newMessage._id) {
              draft.activeChannelInfo.messages[i] = newMessage;
              break;
            }
          }
        }

        if (
          draft.channels[newMessage.channelId] &&
          draft.channels[newMessage.channelId].lastMessage?._id ===
            newMessage._id
        ) {
          draft.channels[newMessage.channelId].lastMessage = newMessage;
        }
        return draft;
      }
      case EChatActions.MESSAGE_IS_DELETING_CHANGED: {
        if (draft.activeChannelInfo) {
          const message = draft.activeChannelInfo.messages.find(
            msg => msg._id === action.payload.messageId,
          );

          if (message) {
            message.isDeleting = action.payload.value;
          }
        }
        return draft;
      }
      case EChatActions.MESSAGE_DELETED: {
        if (draft.activeChannelInfo) {
          draft.activeChannelInfo.messages =
            draft.activeChannelInfo.messages.filter(
              message => message._id !== action.payload.message._id,
            );
        }

        let lastMessage = action.payload.lastMessage;
        if (!!lastMessage) {
          wrapMessageDates(lastMessage);
        }
        draft.channels[action.payload.message.channelId].lastMessage =
          lastMessage;

        return draft;
      }
      default:
        return draft;
    }
  });

const wrapChannelsDates = (channels: IChannels) => {
  Object.values(channels).forEach(channel => {
    wrapChannelDates(channel);
  });

  return channels;
};

const wrapChannelDates = (channel: IChannel) => {
  if (channel.lastMessage) {
    wrapMessageDates(channel.lastMessage);
  }

  channel.members.forEach(member => {
    if (!(member.lastSeen instanceof Date))
      member.lastSeen = new Date(member.lastSeen);
  });

  return channel;
};

const wrapMessagesDates = (messages: IMessage[]) => {
  messages.forEach(message => {
    wrapMessageDates(message);
  });

  return messages;
};

const wrapMessageDates = (message: IMessage) => {
  if (!(message.createdAt instanceof Date))
    message.createdAt = new Date(message.createdAt);
  if (!(message.updatedAt instanceof Date))
    message.updatedAt = new Date(message.updatedAt);

  return message;
};

export default chat;

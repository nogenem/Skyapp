import { TMessageType } from '~/constants/message_types';
import { TUserStatus } from '~/constants/user_status';

interface IOtherUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: TUserStatus;
  online: boolean;
  channelId?: string;
}

interface IOtherUsers {
  [_id: string]: IOtherUser;
}

interface IMember {
  userId: string;
  isAdm: boolean;
  lastSeen: Date;
}

interface IChannel {
  _id: string;
  name: string;
  isGroup: boolean;
  members: IMember[];
  otherMemberIdx?: number;
  unreadMsgs: number;
  lastMessage?: IMessage;
}

interface IChannels {
  [_id: string]: IChannel;
}

interface IAttachment {
  originalName: string;
  size: number;
  path: string;
  mimeType: string;
  imageDimensions?: { width: number; height: number };
}

interface IMessage {
  _id: string;
  channelId: string;
  fromId?: string;
  body: string | IAttachment;
  type: TMessageType;
  createdAt: Date;
  updatedAt: Date;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

interface IInitialData {
  users: IOtherUsers;
  channels: IChannels;
}

interface IActiveChannelInfo {
  _id: string;
  messages: IMessage[];
  totalMessages: number;
  queue: IMessage[];
}

type TChatState = {
  users: IOtherUsers;
  channels: IChannels;
  activeChannelInfo?: IActiveChannelInfo;
};

enum EChatActions {
  INITIAL_DATA_LOADED = '@chat/INITIAL_DATA_LOADED',
  USER_ONLINE_STATUS_CHANGED = '@chat/USER_ONLINE_STATUS_CHANGED',
  CHANNEL_CREATED_OR_UPDATED = '@chat/CHANNEL_CREATED_OR_UPDATED',
  ACTIVE_CHANNEL_CHANGED = '@chat/ACTIVE_CHANNEL_CHANGED',
  REMOVED_FROM_CHANNEL = '@chat/REMOVED_FROM_CHANNEL',
  NEW_USER_CONFIRMED = '@chat/NEW_USER_CONFIRMED',
  NEW_MESSAGES_RECEIVED = '@chat/NEW_MESSAGES_RECEIVED',
  MESSAGE_ENQUEUED = '@chat/MESSAGE_ENQUEUED',
  MESSAGE_DEQUEUED = '@chat/MESSAGE_DEQUEUED',
  LAST_SEEN_CHANGED = '@chat/LAST_SEEN_CHANGED',
  USER_STATUS_CHANGED = '@chat/USER_STATUS_CHANGED',
  USER_THOUGHTS_CHANGED = '@chat/USER_THOUGHTS_CHANGED',
  MESSAGE_IS_UPDATING_CHANGED = '@chat/MESSAGE_IS_UPDATING_CHANGED',
  MESSAGE_UPDATED = '@chat/MESSAGE_UPDATED',
  MESSAGE_IS_DELETING_CHANGED = '@chat/MESSAGE_IS_DELETING_CHANGED',
  MESSAGE_DELETED = '@chat/MESSAGE_DELETED',
}

interface IChatActionType<T, P> {
  type: T;
  payload: P;
}

type TChatAction =
  | IChatActionType<typeof EChatActions.INITIAL_DATA_LOADED, IInitialData>
  | IChatActionType<
      typeof EChatActions.USER_ONLINE_STATUS_CHANGED,
      { _id: string; value: boolean }
    >
  | IChatActionType<typeof EChatActions.CHANNEL_CREATED_OR_UPDATED, IChannel>
  | IChatActionType<
      typeof EChatActions.ACTIVE_CHANNEL_CHANGED,
      { _id: string | undefined }
    >
  | IChatActionType<
      typeof EChatActions.REMOVED_FROM_CHANNEL,
      { channelId: string }
    >
  | IChatActionType<typeof EChatActions.NEW_USER_CONFIRMED, IOtherUser>
  | IChatActionType<
      typeof EChatActions.NEW_MESSAGES_RECEIVED,
      {
        messages: IMessage[];
        totalMessages: number;
        atTop: boolean;
      }
    >
  | IChatActionType<typeof EChatActions.MESSAGE_ENQUEUED, IMessage>
  | IChatActionType<typeof EChatActions.MESSAGE_DEQUEUED, IMessage>
  | IChatActionType<
      typeof EChatActions.LAST_SEEN_CHANGED,
      {
        channelId: string;
        userId: string;
        lastSeen: string;
      }
    >
  | IChatActionType<
      typeof EChatActions.USER_STATUS_CHANGED,
      {
        userId: string;
        newStatus: TUserStatus;
      }
    >
  | IChatActionType<
      typeof EChatActions.USER_THOUGHTS_CHANGED,
      {
        userId: string;
        newThoughts: string;
      }
    >
  | IChatActionType<
      typeof EChatActions.MESSAGE_IS_UPDATING_CHANGED,
      {
        messageId: string;
        value: boolean;
      }
    >
  | IChatActionType<typeof EChatActions.MESSAGE_UPDATED, IMessage>
  | IChatActionType<
      typeof EChatActions.MESSAGE_IS_DELETING_CHANGED,
      {
        messageId: string;
        value: boolean;
      }
    >
  | IChatActionType<
      typeof EChatActions.MESSAGE_DELETED,
      {
        message: IMessage;
        lastMessage?: IMessage;
      }
    >;

export type {
  TChatState,
  TChatAction,
  IInitialData,
  IOtherUsers,
  IOtherUser,
  IChannel,
  IChannels,
  IMember,
  IMessage,
  IAttachment,
  IActiveChannelInfo,
};
export { EChatActions };

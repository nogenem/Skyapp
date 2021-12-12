import { TMessageType } from '~/constants/message_types';
import { TUserStatus } from '~/constants/user_status';

interface IOtherUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: TUserStatus;
  online: boolean;
  channel_id?: string;
}

interface IOtherUsers {
  [_id: string]: IOtherUser;
}

interface IMember {
  user_id: string;
  is_adm: boolean;
  last_seen: Date;
}

interface IChannel {
  _id: string;
  name: string;
  is_group: boolean;
  members: IMember[];
  other_member_idx?: number;
  unread_msgs: number;
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
  channel_id: string;
  from_id?: string;
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

interface INewGroupCredentials {
  name: string;
  members: string[];
  admins: string[];
}

interface IUpdateGroupCredentials {
  channel_id: string;
  name: string;
  members: string[];
  admins: string[];
}

interface ILeaveGroupCredentials {
  channel_id: string;
}

interface IFetchMessagesCredentials {
  channel_id: string;
  offset: number;
  limit?: number;
  sort?: string;
}

interface ISendMessageCredentials {
  channel_id: string;
  body: string;
}

interface ISendFilesCredentials {
  channel_id: string;
  files: FormData;
}

interface IEditMessageCredentials {
  message: IMessage;
  newBody: string;
}

interface IDeleteMessageCredentials {
  message: IMessage;
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
        channel_id: string;
        user_id: string;
        last_seen: string;
      }
    >
  | IChatActionType<
      typeof EChatActions.USER_STATUS_CHANGED,
      {
        user_id: string;
        newStatus: TUserStatus;
      }
    >
  | IChatActionType<
      typeof EChatActions.USER_THOUGHTS_CHANGED,
      {
        user_id: string;
        newThoughts: string;
      }
    >
  | IChatActionType<
      typeof EChatActions.MESSAGE_IS_UPDATING_CHANGED,
      {
        message_id: string;
        value: boolean;
      }
    >
  | IChatActionType<typeof EChatActions.MESSAGE_UPDATED, IMessage>
  | IChatActionType<
      typeof EChatActions.MESSAGE_IS_DELETING_CHANGED,
      {
        message_id: string;
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
  INewGroupCredentials,
  IUpdateGroupCredentials,
  ILeaveGroupCredentials,
  IFetchMessagesCredentials,
  ISendMessageCredentials,
  ISendFilesCredentials,
  IEditMessageCredentials,
  IDeleteMessageCredentials,
  IActiveChannelInfo,
};
export { EChatActions };

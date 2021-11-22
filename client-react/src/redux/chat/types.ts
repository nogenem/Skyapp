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

type TChatState = {
  users: IOtherUsers;
  channels: IChannels;
  activeChannelInfo?: IActiveChannelInfo;
};

enum EChatActions {
  SET_INITIAL_DATA = '@chat/SET_INITIAL_DATA',
  SET_USER_ONLINE = '@chat/SET_USER_ONLINE',
  ADD_OR_UPDATE_CHANNEL = '@chat/ADD_OR_UPDATE_CHANNEL',
  SET_ACTIVE_CHANNEL = '@chat/SET_ACTIVE_CHANNEL',
  REMOVE_CHANNEL = '@chat/REMOVE_CHANNEL',
  ADD_NEW_USER = '@chat/ADD_NEW_USER',
  ADD_MESSAGES = '@chat/ADD_MESSAGES',
  SET_LATEST_MESSAGE = '@chat/SET_LATEST_MESSAGE',
  ADD_TO_MESSAGES_QUEUE = '@chat/ADD_TO_MESSAGES_QUEUE',
  REMOVE_FROM_MESSAGES_QUEUE = '@chat/REMOVE_FROM_MESSAGES_QUEUE',
  SET_LAST_SEEN = '@chat/SET_LAST_SEEN',
  SET_USER_STATUS = '@chat/SET_USER_STATUS',
  SET_USER_THOUGHTS = '@chat/SET_USER_THOUGHTS',
}

interface IChatActionType<T, P> {
  type: T;
  payload: P;
}

type TChatAction =
  | IChatActionType<typeof EChatActions.SET_INITIAL_DATA, IInitialData>
  | IChatActionType<
      typeof EChatActions.SET_USER_ONLINE,
      { _id: string; value: boolean }
    >
  | IChatActionType<typeof EChatActions.ADD_OR_UPDATE_CHANNEL, IChannel>
  | IChatActionType<
      typeof EChatActions.SET_ACTIVE_CHANNEL,
      { _id: string | undefined }
    >
  | IChatActionType<typeof EChatActions.REMOVE_CHANNEL, { channelId: string }>
  | IChatActionType<typeof EChatActions.ADD_NEW_USER, IOtherUser>
  | IChatActionType<
      typeof EChatActions.ADD_MESSAGES,
      { messages: IMessage[]; totalMessages: number; atTop: boolean }
    >
  | IChatActionType<typeof EChatActions.SET_LATEST_MESSAGE, IMessage>
  | IChatActionType<typeof EChatActions.ADD_TO_MESSAGES_QUEUE, IMessage>
  | IChatActionType<typeof EChatActions.REMOVE_FROM_MESSAGES_QUEUE, IMessage>
  | IChatActionType<
      typeof EChatActions.SET_LAST_SEEN,
      {
        channel_id: string;
        user_id: string;
        last_seen: string;
      }
    >
  | IChatActionType<
      typeof EChatActions.SET_USER_STATUS,
      {
        user_id: string;
        newStatus: TUserStatus;
      }
    >
  | IChatActionType<
      typeof EChatActions.SET_USER_THOUGHTS,
      {
        user_id: string;
        newThoughts: string;
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
};
export { EChatActions };

import { TUserStatus } from '~/constants/user_status';

interface IOtherUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: TUserStatus;
  online: boolean;
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
  online: boolean;
  members: IMember[];
}

interface IChannels {
  [_id: string]: IChannel;
}

interface IMessage {
  _id: string;
}

interface IInitialData {
  users: IOtherUsers;
  channels: IChannels;
}

interface IActiveChannelInfo {
  _id: string;
  messages: IMessage[];
  totalMessages: number;
}

type TChatState = {
  users: IOtherUsers;
  channels: IChannels;
  activeChannelInfo?: IActiveChannelInfo;
};

enum EChatActions {
  SET_INITIAL_DATA = '@chat/SET_INITIAL_DATA',
  SET_USER_ONLINE = '@chat/SET_USER_ONLINE',
  ADD_NEW_CHANNEL = '@chat/ADD_NEW_CHANNEL',
  SET_ACTIVE_CHANNEL = '@chat/SET_ACTIVE_CHANNEL',
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
  | IChatActionType<typeof EChatActions.ADD_NEW_CHANNEL, IChannel>
  | IChatActionType<typeof EChatActions.SET_ACTIVE_CHANNEL, { _id: string }>;

export type {
  TChatState,
  TChatAction,
  IInitialData,
  IOtherUser,
  IChannel,
  IMember,
};
export { EChatActions };

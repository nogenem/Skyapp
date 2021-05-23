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

interface IChannel {
  _id: string;
}

interface IChannels {
  [_id: string]: IChannel;
}

interface IInitialData {
  users: IOtherUsers;
  channels: IChannels;
}

type TChatState = {
  users: IOtherUsers;
  channels: IChannels;
};

enum EChatActions {
  SET_INITIAL_DATA = '@chat/SET_INITIAL_DATA',
  SET_USER_ONLINE = '@chat/SET_USER_ONLINE',
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
    >;

export type { TChatState, TChatAction, IInitialData, IOtherUser };
export { EChatActions };

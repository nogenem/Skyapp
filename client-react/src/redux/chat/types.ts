interface IOtherUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: number;
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
}

interface IChatActionType<T, P> {
  type: T;
  payload: P;
}

type TChatAction = IChatActionType<
  typeof EChatActions.SET_INITIAL_DATA,
  IInitialData
>;

export type { TChatState, TChatAction, IInitialData };
export { EChatActions };

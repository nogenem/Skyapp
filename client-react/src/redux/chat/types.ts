// TODO
type TChatState = {
  channels: null;
};

enum EChatActions {
  SET_INITIAL_DATA = '@chat/SET_INITIAL_DATA',
}

interface IChatActionType<T, P> {
  type: T;
  payload: P;
}

// TODO
type TChatAction = IChatActionType<typeof EChatActions.SET_INITIAL_DATA, null>;

export type { TChatState, TChatAction };
export { EChatActions };

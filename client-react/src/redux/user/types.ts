interface User {
  _id: string;
  token?: string;
}

type UserState = User;

enum EUserActions {
  SIGNED_IN = '@user/SIGNED_IN',
  SIGNED_OUT = '@user/SIGNED_OUT',
}

interface UserActionType<T, P> {
  type: T;
  payload: P;
}

type UserAction =
  | UserActionType<typeof EUserActions.SIGNED_IN, User>
  | UserActionType<typeof EUserActions.SIGNED_OUT, null>;

export type { User, UserState, UserAction };
export { EUserActions };

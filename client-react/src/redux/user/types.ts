export interface User {
  _id: string;
  token?: string;
}

export type UserState = User;

export enum UserActions {
  SIGNED_IN = '@user/SIGNED_IN',
  SIGNED_OUT = '@user/SIGNED_OUT',
}

interface UserActionType<T, P> {
  type: T;
  payload: P;
}

export type UserAction =
  | UserActionType<typeof UserActions.SIGNED_IN, User>
  | UserActionType<typeof UserActions.SIGNED_OUT, null>;

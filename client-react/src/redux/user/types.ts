import type { TUserStatus } from '~/constants/user_status';

interface IUser {
  _id: string;
  nickname: string;
  email: string;
  confirmed: boolean;
  status: TUserStatus;
  thoughts: string;
  token?: string;
}

type TUserState = IUser;

enum EUserActions {
  SIGNED_IN = '@user/SIGNED_IN',
  SIGNED_OUT = '@user/SIGNED_OUT',
  STATUS_CHANGED = '@user/STATUS_CHANGED',
  THOUGHTS_CHANGED = '@user/THOUGHTS_CHANGED',
}

interface IUserActionType<T, P> {
  type: T;
  payload: P;
}

type TUserAction =
  | IUserActionType<typeof EUserActions.SIGNED_IN, IUser>
  | IUserActionType<typeof EUserActions.SIGNED_OUT, null>
  | IUserActionType<typeof EUserActions.STATUS_CHANGED, TUserStatus>
  | IUserActionType<typeof EUserActions.THOUGHTS_CHANGED, string>;

export type { IUser, TUserState, TUserAction };
export { EUserActions };

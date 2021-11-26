import type { TUserStatus } from '~/constants/user_status';

interface ISignUpCredentials {
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface ISignInCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ITokenCredentials {
  token: string;
}

interface IForgotPasswordCredentials {
  email: string;
}

interface IResetPasswordCredentials {
  newPassword: string;
  newPasswordConfirmation: string;
  token: string;
}

interface IChangeStatusCredentials {
  newStatus: TUserStatus;
}

interface IChangeThoughtsCredentials {
  newThoughts: string;
}

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

export type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IChangeThoughtsCredentials,
  IUser,
  TUserState,
  TUserAction,
};
export { EUserActions };

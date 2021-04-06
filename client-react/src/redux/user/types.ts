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

interface IUser {
  _id: string;
  nickname: string;
  email: string;
  confirmed: boolean;
  status: number;
  thoughts: string;
  token?: string;
}

type TUserState = IUser;

enum EUserActions {
  SIGNED_IN = '@user/SIGNED_IN',
  SIGNED_OUT = '@user/SIGNED_OUT',
}

interface IUserActionType<T, P> {
  type: T;
  payload: P;
}

type TUserAction =
  | IUserActionType<typeof EUserActions.SIGNED_IN, IUser>
  | IUserActionType<typeof EUserActions.SIGNED_OUT, null>;

export type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IUser,
  TUserState,
  TUserAction,
};
export { EUserActions };

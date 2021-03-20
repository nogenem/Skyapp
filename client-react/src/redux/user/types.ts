interface ICredentials {
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface IUser {
  _id: string;
  nickname: string;
  email: string;
  confirmed: boolean;
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

export type { ICredentials, IUser, TUserState, TUserAction };
export { EUserActions };

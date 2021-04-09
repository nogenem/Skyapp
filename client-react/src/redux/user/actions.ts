import { Dispatch } from 'redux';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import { TUserStatus } from '~/constants/user_status';
import api from '~/services/api';
import setAuthorizationHeader from '~/utils/setAuthorizationHeader';

import { EUserActions } from './types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IUser,
  TUserAction,
} from './types';

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  localStorage.setItem(LOCAL_STORAGE_TOKEN, user.token as string);
  setAuthorizationHeader(user.token);

  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
};

const userChangedStatus = (newStatus: TUserStatus) => ({
  type: EUserActions.CHANGED_STATUS,
  payload: newStatus,
});

export const userSignedOut = () => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN);
  setAuthorizationHeader();

  return {
    type: EUserActions.SIGNED_OUT,
  };
};

export const signUp = (credentials: ISignUpCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.signUp(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const signIn = (credentials: ISignInCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.signIn(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const confirmation = (credentials: ITokenCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.confirmation(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const resendConfirmationEmail = (credentials: ITokenCredentials) => () =>
  api.auth.resendConfirmationEmail(credentials);

export const validateToken = (credentials: ITokenCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.validateToken(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const forgotPassword = (credentials: IForgotPasswordCredentials) => () =>
  api.auth.forgotPassword(credentials);

export const resetPassword = (credentials: IResetPasswordCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.resetPassword(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const changeStatus = (credentials: IChangeStatusCredentials) => (
  dispatch: Dispatch,
) =>
  api.user.changeStatus(credentials).then(() => {
    dispatch(userChangedStatus(credentials.newStatus));
  });

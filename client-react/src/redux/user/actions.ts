import { Dispatch } from 'redux';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import setAuthorizationHeader from '~/utils/setAuthorizationHeader';

import { connectIo, disconnectIo } from '../chat/actions';
import { EUserActions } from './types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IChangeThoughtsCredentials,
  IUser,
  TUserAction,
} from './types';

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  localStorage.setItem(LOCAL_STORAGE_TOKEN, user.token as string);
  setAuthorizationHeader(user.token);

  if (user.confirmed) {
    connectIo(user)(dispatch);
  }

  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
};

const userChangedStatus = (newStatus: TUserStatus) => ({
  type: EUserActions.CHANGED_STATUS,
  payload: newStatus,
});

const userChangedThoughts = (newThoughts: string) => ({
  type: EUserActions.CHANGED_THOUGHTS,
  payload: newThoughts,
});

export const userSignedOut = () => (dispatch: Dispatch) => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN);
  setAuthorizationHeader();

  disconnectIo()(dispatch);

  dispatch<TUserAction>({
    type: EUserActions.SIGNED_OUT,
    payload: null,
  });
};

export const signUp =
  (credentials: ISignUpCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.signUp(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const signIn =
  (credentials: ISignInCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.signIn(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const confirmation =
  (credentials: ITokenCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.confirmation(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const resendConfirmationEmail = (credentials: ITokenCredentials) => () =>
  ApiService.auth.resendConfirmationEmail(credentials);

export const validateToken =
  (credentials: ITokenCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.validateToken(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const forgotPassword = (credentials: IForgotPasswordCredentials) => () =>
  ApiService.auth.forgotPassword(credentials);

export const resetPassword =
  (credentials: IResetPasswordCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.resetPassword(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const changeStatus =
  (credentials: IChangeStatusCredentials) => (dispatch: Dispatch) =>
    ApiService.user.changeStatus(credentials).then(() => {
      dispatch(userChangedStatus(credentials.newStatus));
    });

export const changeThoughts =
  (credentials: IChangeThoughtsCredentials) => (dispatch: Dispatch) =>
    ApiService.user.changeThoughts(credentials).then(() => {
      dispatch(userChangedThoughts(credentials.newThoughts));
    });

export const broadcastUserStatusChanged =
  (newStatus: TUserStatus) => (dispatch: Dispatch) => {
    const instance = IoService.instance();
    instance.socket!.emit(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, { newStatus });

    dispatch(userChangedStatus(newStatus));
  };

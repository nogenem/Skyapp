import { Dispatch } from 'redux';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import setAuthorizationHeader from '~/utils/setAuthorizationHeader';

import {
  userSignedIn as chatUserSignedIn,
  userSignedOut as chatUserSignedOut,
} from '../chat/actions';
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
    chatUserSignedIn(user)(dispatch);
  }

  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
};

const userStatusChanged = (newStatus: TUserStatus) => ({
  type: EUserActions.STATUS_CHANGED,
  payload: newStatus,
});

const userThoughtsChanged = (newThoughts: string) => ({
  type: EUserActions.THOUGHTS_CHANGED,
  payload: newThoughts,
});

export const userSignedOut = () => (dispatch: Dispatch) => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN);
  setAuthorizationHeader();

  chatUserSignedOut()();

  dispatch<TUserAction>({
    type: EUserActions.SIGNED_OUT,
    payload: null,
  });
};

export const sendSignUp =
  (credentials: ISignUpCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.signUp(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendSignIn =
  (credentials: ISignInCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.signIn(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendConfirmation =
  (credentials: ITokenCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.confirmation(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const SendResendConfirmationEmail =
  (credentials: ITokenCredentials) => () =>
    ApiService.auth.resendConfirmationEmail(credentials);

export const sendValidateToken =
  (credentials: ITokenCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.validateToken(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendForgotPassword =
  (credentials: IForgotPasswordCredentials) => () =>
    ApiService.auth.forgotPassword(credentials);

export const sendResetPassword =
  (credentials: IResetPasswordCredentials) => (dispatch: Dispatch) =>
    ApiService.auth.resetPassword(credentials).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendChangeStatus =
  (credentials: IChangeStatusCredentials) => (dispatch: Dispatch) =>
    ApiService.user.updateStatus(credentials).then(() => {
      dispatch(userStatusChanged(credentials.newStatus));
    });

export const sendChangeThoughts =
  (credentials: IChangeThoughtsCredentials) => (dispatch: Dispatch) =>
    ApiService.user.updateThoughts(credentials).then(() => {
      dispatch(userThoughtsChanged(credentials.newThoughts));
    });

export const emitUserStatusChanged =
  (newStatus: TUserStatus) => (dispatch: Dispatch) => {
    const instance = IoService.instance();
    instance.socket!.emit(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, { newStatus });

    dispatch(userStatusChanged(newStatus));
  };

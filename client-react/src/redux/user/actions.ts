import { Dispatch } from 'redux';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import type {
  IConfirmationRequestBody,
  IForgotPasswordRequestBody,
  IResendConfirmationRequestBody,
  IResetPasswordRequestBody,
  ISignInRequestBody,
  ISignUpRequestBody,
  IValidateTokenRequestBody,
} from '~/requestsParts/auth';
import type {
  IChangeStatusRequestBody,
  IChangeThoughtsRequestBody,
} from '~/requestsParts/user';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import setAuthorizationHeader from '~/utils/setAuthorizationHeader';

import {
  userSignedIn as chatUserSignedIn,
  userSignedOut as chatUserSignedOut,
} from '../chat/actions';
import { EUserActions } from './types';
import type { IUser, TUserAction } from './types';

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

export const sendSignUp = (data: ISignUpRequestBody) => (dispatch: Dispatch) =>
  ApiService.auth.signUp(data).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const sendSignIn = (data: ISignInRequestBody) => (dispatch: Dispatch) =>
  ApiService.auth.signIn(data).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const sendConfirmation =
  (data: IConfirmationRequestBody) => (dispatch: Dispatch) =>
    ApiService.auth.confirmation(data).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const SendResendConfirmationEmail =
  (data: IResendConfirmationRequestBody) => () =>
    ApiService.auth.resendConfirmationEmail(data);

export const sendValidateToken =
  (data: IValidateTokenRequestBody) => (dispatch: Dispatch) =>
    ApiService.auth.validateToken(data).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendForgotPassword = (data: IForgotPasswordRequestBody) => () =>
  ApiService.auth.forgotPassword(data);

export const sendResetPassword =
  (data: IResetPasswordRequestBody) => (dispatch: Dispatch) =>
    ApiService.auth.resetPassword(data).then(({ user }) => {
      userSignedIn(user)(dispatch);
    });

export const sendChangeStatus =
  (data: IChangeStatusRequestBody) => (dispatch: Dispatch) =>
    ApiService.user.updateStatus(data).then(() => {
      dispatch(userStatusChanged(data.newStatus));
    });

export const sendChangeThoughts =
  (data: IChangeThoughtsRequestBody) => (dispatch: Dispatch) =>
    ApiService.user.updateThoughts(data).then(() => {
      dispatch(userThoughtsChanged(data.newThoughts));
    });

export const emitUserStatusChanged =
  (newStatus: TUserStatus) => (dispatch: Dispatch) => {
    const instance = IoService.instance();
    instance.socket!.emit(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, { newStatus });

    dispatch(userStatusChanged(newStatus));
  };

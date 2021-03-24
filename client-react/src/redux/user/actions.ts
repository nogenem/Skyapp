import { Dispatch } from 'redux';

import api from '~/services/api';

import { EUserActions } from './types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  IConfirmationCredentials,
  IUser,
  TUserAction,
} from './types';

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
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

export const confirmation = (credentials: IConfirmationCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.confirmation(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const resendConfirmationEmail = (
  credentials: IConfirmationCredentials,
) => () => api.auth.resendConfirmationEmail(credentials);

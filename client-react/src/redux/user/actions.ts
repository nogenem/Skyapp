import { Dispatch } from 'redux';

import api from '~/services/api';

import { EUserActions } from './types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  IUser,
  TUserAction,
} from './types';

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
};

export const signup = (credentials: ISignUpCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.signup(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

export const signin = (credentials: ISignInCredentials) => (
  dispatch: Dispatch,
) =>
  api.auth.signin(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

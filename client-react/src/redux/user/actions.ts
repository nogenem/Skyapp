import { Dispatch } from 'redux';

import api from '~/services/api';

import { EUserActions } from './types';
import type { ICredentials, IUser, TUserAction } from './types';

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  dispatch<TUserAction>({
    type: EUserActions.SIGNED_IN,
    payload: user,
  });
};

export const signin = () => (dispatch: Dispatch) => {};

export const signup = (credentials: ICredentials) => (dispatch: Dispatch) =>
  api.auth.signup(credentials).then(({ user }) => {
    userSignedIn(user)(dispatch);
  });

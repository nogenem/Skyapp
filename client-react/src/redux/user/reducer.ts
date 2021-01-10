import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EUserActions } from './types';
import type { TUserAction, TUserState } from './types';

export const initialState: TUserState = {
  _id: '',
  token: '',
};

export default function user(
  state = initialState,
  action: TUserAction,
): TUserState {
  switch (action.type) {
    case EUserActions.SIGNED_IN:
      return state;
    case EUserActions.SIGNED_OUT:
      return state;
    default:
      return state;
  }
}

// Selectors
export const getUser = (state: IAppState) => state.user || initialState;
export const getId = createSelector(getUser, userData => userData._id || '');
export const getToken = createSelector(
  getUser,
  userData => userData.token || '',
);

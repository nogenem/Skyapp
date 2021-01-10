import { createSelector } from 'reselect';

import type { AppState } from '../store';
import { EUserActions } from './types';
import type { UserAction, UserState } from './types';

export const initialState: UserState = {
  _id: '',
  token: '',
};

export default function user(
  state = initialState,
  action: UserAction,
): UserState {
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
export const getUser = (state: AppState) => state.user || initialState;
export const getId = createSelector(getUser, userData => userData._id || '');
export const getToken = createSelector(
  getUser,
  userData => userData.token || '',
);

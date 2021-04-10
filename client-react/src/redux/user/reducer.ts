import { createSelector } from 'reselect';

import { USER_STATUS } from '~/constants/user_status';

import type { IAppState } from '../store';
import { EUserActions } from './types';
import type { TUserAction, TUserState } from './types';

export const initialState: TUserState = {
  _id: '',
  nickname: '',
  email: '',
  confirmed: false,
  status: USER_STATUS.ACTIVE,
  thoughts: '',
  token: '',
};

export default function user(
  state = initialState,
  action: TUserAction,
): TUserState {
  switch (action.type) {
    case EUserActions.SIGNED_IN:
      const {
        _id,
        nickname,
        email,
        confirmed,
        status,
        thoughts,
        token,
      } = action.payload;
      return { _id, nickname, email, confirmed, status, thoughts, token };
    case EUserActions.SIGNED_OUT:
      return initialState;
    case EUserActions.CHANGED_STATUS:
      return { ...state, status: action.payload };
    case EUserActions.CHANGED_THOUGHTS:
      return { ...state, thoughts: action.payload };
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
export const getConfirmed = createSelector(
  getUser,
  userData => !!userData.confirmed,
);
export const getNickname = createSelector(
  getUser,
  userData => userData.nickname || '',
);
export const getStatus = createSelector(getUser, userData => userData.status);
export const getThoughts = createSelector(
  getUser,
  userData => userData.thoughts || '',
);

import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { initialState } from './reducer';

export const selectUser = (state: IAppState) => state.user || initialState;

export const selectUserId = createSelector(
  selectUser,
  userData => userData._id || '',
);

export const selectUserToken = createSelector(
  selectUser,
  userData => userData.token || '',
);

export const selectUserConfirmed = createSelector(
  selectUser,
  userData => !!userData.confirmed,
);

export const selectUserNickname = createSelector(
  selectUser,
  userData => userData.nickname || '',
);

export const selectUserStatus = createSelector(
  selectUser,
  userData => userData.status,
);

export const selectUserThoughts = createSelector(
  selectUser,
  userData => userData.thoughts || '',
);

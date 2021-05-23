import produce from 'immer';
import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EChatActions } from './types';
import type { TChatAction, TChatState } from './types';

export const initialState: TChatState = {
  users: {},
  channels: {},
};

export default function chat(
  state = initialState,
  action: TChatAction,
): TChatState {
  return produce(state, draft => {
    switch (action.type) {
      case EChatActions.SET_INITIAL_DATA:
        draft.users = action.payload.users;
        draft.channels = action.payload.channels;
        return draft;
      case EChatActions.SET_USER_ONLINE:
        if (draft.users[action.payload._id]) {
          draft.users[action.payload._id].online = action.payload.value;
        }
        return draft;
      default:
        return draft;
    }
  });
}

// SELECTORS
export const getChat = (state: IAppState) => state.chat || initialState;
export const getUsers = createSelector(getChat, data => data.users);
export const getChannels = createSelector(getChat, data => data.channels);

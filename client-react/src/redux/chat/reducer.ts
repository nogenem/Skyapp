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
  switch (action.type) {
    case EChatActions.SET_INITIAL_DATA:
      return {
        ...state,
        users: action.payload.users,
        channels: action.payload.channels,
      };
    default:
      return state;
  }
}

// SELECTORS
export const getChat = (state: IAppState) => state.chat || initialState;
export const getUsers = createSelector(getChat, data => data.users);
export const getChannels = createSelector(getChat, data => data.channels);

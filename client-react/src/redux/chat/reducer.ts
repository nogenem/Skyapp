import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EChatActions } from './types';
import type { TChatAction, TChatState } from './types';

// TODO
export const initialState: TChatState = {
  channels: null,
};

export default function chat(
  state = initialState,
  action: TChatAction,
): TChatState {
  switch (action.type) {
    // TODO
    case EChatActions.SET_INITIAL_DATA:
      return state;
    default:
      return state;
  }
}

// SELECTORS
export const getChat = (state: IAppState) => state.chat || initialState;
export const getChannels = createSelector(getChat, data => data.channels);

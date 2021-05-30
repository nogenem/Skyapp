import produce from 'immer';
import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EChatActions } from './types';
import type { TChatAction, TChatState } from './types';

export const initialState: TChatState = {
  users: {},
  channels: {},
  activeChannelInfo: undefined,
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
      case EChatActions.ADD_NEW_CHANNEL:
        if (!draft.channels[action.payload._id]) {
          draft.channels[action.payload._id] = action.payload;
          if (!action.payload.is_group) {
            action.payload.members.forEach(member => {
              if (draft.users[member.user_id]) {
                draft.users[member.user_id].channel_id = action.payload._id;
              }
            });
          }
        }
        return draft;
      case EChatActions.SET_ACTIVE_CHANNEL:
        if (draft.channels[action.payload._id]) {
          draft.activeChannelInfo = {
            _id: action.payload._id,
            messages: [],
            totalMessages: 0,
          };
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

export const getUsersArray = createSelector(getChat, data =>
  Object.values(data.users),
);
export const getUsersWithoutChannelArray = createSelector(getChat, data =>
  Object.values(data.users).filter(user => !user.channel_id),
);

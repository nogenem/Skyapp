import { USER_STATUS } from '~/constants/user_status';

import userReducer from '../reducer';
import type { TChatAction, IInitialData, TChatState } from '../types';
import { EChatActions } from '../types';

describe('chat reducer', () => {
  it('should handle SET_INITIAL_DATA', () => {
    const initialData: IInitialData = { users: {}, channels: {} };
    const action: TChatAction = {
      type: EChatActions.SET_INITIAL_DATA,
      payload: initialData,
    };

    const newState = userReducer(undefined, action);
    expect(newState.users).toEqual(action.payload.users);
    expect(newState.channels).toEqual(action.payload.channels);
  });

  it('should handle SET_USER_ONLINE', () => {
    const userId = '123456';
    const initialState: TChatState = {
      users: {
        [userId]: {
          _id: userId,
          nickname: 'Test',
          thoughts: '',
          status: USER_STATUS.ACTIVE,
          online: false,
        },
      },
      channels: {},
    };

    // value = true
    let data = { _id: userId, value: true };
    let action: TChatAction = {
      type: EChatActions.SET_USER_ONLINE,
      payload: data,
    };

    let newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);

    data = { _id: userId, value: false };
    action = {
      type: EChatActions.SET_USER_ONLINE,
      payload: data,
    };

    newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);
  });
});

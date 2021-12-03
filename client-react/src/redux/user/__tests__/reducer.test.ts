import { USER_STATUS } from '~/constants/user_status';
import FACTORIES from '~/utils/factories';

import userReducer, { initialState } from '../reducer';
import { EUserActions, IUser } from '../types';
import type { TUserAction, TUserState } from '../types';

describe('user reducer', () => {
  it('should handle SIGNED_IN', () => {
    const user: IUser = FACTORIES.models.user();
    const action: TUserAction = { type: EUserActions.SIGNED_IN, payload: user };

    expect(userReducer(undefined, action)).toEqual(action.payload);
  });

  it('should handle SIGNED_OUT', () => {
    const state: TUserState = FACTORIES.states.user();
    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    expect(userReducer(state, action)).toEqual(initialState);
  });

  it('should handle STATUS_CHANGED', () => {
    const state: TUserState = FACTORIES.states.user({
      status: USER_STATUS.ACTIVE,
    });
    const action: TUserAction = {
      type: EUserActions.STATUS_CHANGED,
      payload: USER_STATUS.AWAY,
    };

    const newState = userReducer(state, action);
    expect(newState.status).toEqual(action.payload);
  });

  it('should handle THOUGHTS_CHANGED', () => {
    const state: TUserState = FACTORIES.states.user({
      thoughts: 'hello',
    });
    const action: TUserAction = {
      type: EUserActions.THOUGHTS_CHANGED,
      payload: 'hello world',
    };

    const newState = userReducer(state, action);
    expect(newState.thoughts).toEqual(action.payload);
  });
});

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
    const user: TUserState = FACTORIES.models.user();
    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    expect(userReducer(user, action)).toEqual(initialState);
  });

  it('should handle CHANGED_STATUS', () => {
    const user: TUserState = FACTORIES.models.user({
      status: USER_STATUS.ACTIVE,
    });
    const action: TUserAction = {
      type: EUserActions.STATUS_CHANGED,
      payload: USER_STATUS.AWAY,
    };

    const newState = userReducer(user, action);
    expect(newState.status).toEqual(action.payload);
  });

  it('should handle CHANGED_THOUGHTS', () => {
    const user: TUserState = FACTORIES.models.user({
      thoughts: 'hello',
    });
    const action: TUserAction = {
      type: EUserActions.THOUGHTS_CHANGED,
      payload: 'hello world',
    };

    const newState = userReducer(user, action);
    expect(newState.thoughts).toEqual(action.payload);
  });
});

import userReducer, { initialState } from '../reducer';
import { EUserActions } from '../types';
import type { User, UserAction } from '../types';

describe('user reducer', () => {
  it('should handle SIGNED_IN', () => {
    const user: User = {
      _id: '1',
    };
    const action: UserAction = { type: EUserActions.SIGNED_IN, payload: user };

    // TODO: Fix this after implementing the action
    expect(userReducer(undefined, action)).toEqual(initialState);
  });

  it('should handle SIGNED_OUT', () => {
    const action: UserAction = { type: EUserActions.SIGNED_OUT, payload: null };

    // TODO: Fix this after implementing the action
    expect(userReducer(undefined, action)).toEqual(initialState);
  });
});

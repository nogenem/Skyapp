import userReducer, { initialState } from '../reducer';
import { EUserActions } from '../types';
import type { IUser, TUserAction } from '../types';

describe('user reducer', () => {
  it('should handle SIGNED_IN', () => {
    const user: IUser = {
      _id: '1',
    };
    const action: TUserAction = { type: EUserActions.SIGNED_IN, payload: user };

    // TODO: Fix this after implementing the action
    expect(userReducer(undefined, action)).toEqual(initialState);
  });

  it('should handle SIGNED_OUT', () => {
    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    // TODO: Fix this after implementing the action
    expect(userReducer(undefined, action)).toEqual(initialState);
  });
});

import userReducer, { initialState } from '../reducer';
import { EUserActions } from '../types';
import type { IUser, TUserAction } from '../types';

describe('user reducer', () => {
  it('should handle SIGNED_IN', () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
    };
    const action: TUserAction = { type: EUserActions.SIGNED_IN, payload: user };

    expect(userReducer(undefined, action)).toEqual(user);
  });

  it('should handle SIGNED_OUT', () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
    };

    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    expect(userReducer(user, action)).toEqual(initialState);
  });
});

import { FACTORIES } from '~/utils/testUtils';

import userReducer, { initialState } from '../reducer';
import { EUserActions } from '../types';
import type { TUserAction, TUserState } from '../types';

describe('user reducer', () => {
  it('should handle SIGNED_IN', () => {
    const user: TUserState = FACTORIES.userState();
    const action: TUserAction = { type: EUserActions.SIGNED_IN, payload: user };

    expect(userReducer(undefined, action)).toEqual(user);
  });

  it('should handle SIGNED_OUT', () => {
    const user: TUserState = FACTORIES.userState();

    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    expect(userReducer(user, action)).toEqual(initialState);
  });
});

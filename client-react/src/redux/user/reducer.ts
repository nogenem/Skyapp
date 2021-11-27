import { USER_STATUS } from '~/constants/user_status';

import { EUserActions } from './types';
import type { TUserAction, TUserState } from './types';

export const initialState: TUserState = {
  _id: '',
  nickname: '',
  email: '',
  confirmed: false,
  status: USER_STATUS.ACTIVE,
  thoughts: '',
  token: '',
};

const user = (state = initialState, action: TUserAction): TUserState => {
  switch (action.type) {
    case EUserActions.SIGNED_IN:
      const { _id, nickname, email, confirmed, status, thoughts, token } =
        action.payload;
      return { _id, nickname, email, confirmed, status, thoughts, token };
    case EUserActions.SIGNED_OUT:
      return initialState;
    case EUserActions.STATUS_CHANGED:
      if (state.status !== action.payload)
        return { ...state, status: action.payload };
      return state;
    case EUserActions.THOUGHTS_CHANGED:
      if (state.thoughts !== action.payload)
        return { ...state, thoughts: action.payload };
      return state;
    default:
      return state;
  }
};

export default user;

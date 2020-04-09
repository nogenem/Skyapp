import { UserAction, UserActions, UserState } from "./types";

export const initialState: UserState = {
  _id: ""
};

export default function user(
  state = initialState,
  action: UserAction
): UserState {
  switch (action.type) {
    case UserActions.SIGNED_IN:
      return state;
    case UserActions.SIGNED_OUT:
      return state;
    default:
      return state;
  }
}

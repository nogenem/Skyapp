import { createSelector } from "reselect";

import { AppState } from "../store";
import { UserAction, UserActions, UserState } from "./types";

export const initialState: UserState = {
  _id: "",
  token: ""
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

// Selectors
export const getUser = (state: AppState) => state.user || initialState;
export const getId = createSelector(getUser, userData => userData._id || "");
export const getToken = createSelector(
  getUser,
  userData => userData.token || ""
);

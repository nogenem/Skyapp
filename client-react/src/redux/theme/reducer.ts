import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { EThemeActions } from './types';
import type { TThemeAction, TThemeState } from './types';

export const initialState: TThemeState = {
  mode: undefined,
};

const theme = (state = initialState, action: TThemeAction): TThemeState => {
  switch (action.type) {
    case EThemeActions.MODE_SWITCHED:
      return {
        ...state,
        mode: action.payload,
      };
    default:
      return state;
  }
};

// SELECTORS
export const getTheme = (state: IAppState) => state.theme || initialState;
export const getThemeMode = createSelector(
  getTheme,
  themeData => themeData.mode,
);

export default theme;

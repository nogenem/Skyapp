import { createSelector } from 'reselect';

import type { IAppState } from '../store';
import { initialState } from './reducer';

export const selectTheme = (state: IAppState) => state.theme || initialState;

export const selectThemeMode = createSelector(
  selectTheme,
  themeData => themeData.mode,
);

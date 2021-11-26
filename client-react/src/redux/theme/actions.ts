import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';

import { EThemeActions } from './types';
import type { TThemeMode } from './types';

export const themeModeSwitched = (mode: TThemeMode) => {
  localStorage.setItem(LOCAL_STORAGE_THEME_MODE, mode);

  return {
    type: EThemeActions.MODE_SWITCHED,
    payload: mode,
  };
};

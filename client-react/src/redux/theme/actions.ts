import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';

import { EThemeActions } from './types';
import type { TThemeMode } from './types';

export const switchMode = (mode: TThemeMode) => {
  localStorage.setItem(LOCAL_STORAGE_THEME_MODE, mode);

  return {
    type: EThemeActions.SWITCH_MODE,
    payload: mode,
  };
};

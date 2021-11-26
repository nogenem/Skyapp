import themeReducer from '../reducer';
import { EThemeActions } from '../types';
import type { TThemeAction, TThemeState, TThemeMode } from '../types';

describe('theme reducer', () => {
  it('should handle MODE_SWITCHED', () => {
    const newMode = 'dark' as TThemeMode;
    const theme: TThemeState = {
      mode: newMode,
    };
    const action: TThemeAction = {
      type: EThemeActions.MODE_SWITCHED,
      payload: newMode,
    };

    expect(themeReducer(undefined, action)).toEqual(theme);
  });
});

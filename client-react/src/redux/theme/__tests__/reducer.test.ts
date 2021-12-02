import FACTORIES from '~/utils/factories';

import themeReducer from '../reducer';
import { EThemeActions } from '../types';
import type { TThemeAction, TThemeState, TThemeMode } from '../types';

describe('theme reducer', () => {
  it('should handle MODE_SWITCHED', () => {
    const newMode = 'dark' as TThemeMode;
    const oldState: TThemeState = FACTORIES.states.theme({
      mode: 'light',
    });

    const action: TThemeAction = {
      type: EThemeActions.MODE_SWITCHED,
      payload: newMode,
    };

    const newState = themeReducer(oldState, action);
    expect(newState.mode).toEqual(newMode);
  });
});

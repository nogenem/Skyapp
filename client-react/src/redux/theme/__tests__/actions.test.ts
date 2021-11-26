import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';
import { getMockStore } from '~/utils/testUtils';

import { themeModeSwitched } from '../actions';
import { EThemeActions } from '../types';
import type { TThemeAction, TThemeMode } from '../types';

const mockStore = getMockStore();

describe('auth actions', () => {
  it('themeModeSwitched', async () => {
    const newMode = 'dark' as TThemeMode;
    const expectedActions = [
      { type: EThemeActions.MODE_SWITCHED, payload: newMode } as TThemeAction,
    ];

    const store = mockStore({});

    store.dispatch(themeModeSwitched(newMode));

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_MODE)).toBe(newMode);
  });
});

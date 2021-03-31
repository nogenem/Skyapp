import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';

import { switchMode } from '../actions';
import { EThemeActions } from '../types';
import type { TThemeAction, TThemeMode } from '../types';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('auth actions', () => {
  it('switchMode', async () => {
    const newMode = 'dark' as TThemeMode;
    const expectedActions = [
      { type: EThemeActions.SWITCH_MODE, payload: newMode } as TThemeAction,
    ];

    const store = mockStore({});

    store.dispatch(switchMode(newMode));

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_MODE)).toBe(newMode);
  });
});

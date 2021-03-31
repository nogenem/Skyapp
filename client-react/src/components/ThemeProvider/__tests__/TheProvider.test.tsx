import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';
import type { IAppState } from '~/redux/store';
import { TThemeMode } from '~/redux/theme/types';

import { ThemeProvider, UnconnectedThemeProvider } from '../index';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const emptyState: Partial<IAppState> = {};
const renderWithRedux = (
  ui: React.ReactNode,
  initialState: Partial<IAppState> = emptyState,
) => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
  };
};

const Children = () => <div />;

// TODO: Add better tests for this !?
describe('Connected ThemeProvider', () => {
  it('renders correctly', async () => {
    const { container } = renderWithRedux(
      <ThemeProvider>
        <Children />
      </ThemeProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ThemeProvider', () => {
  it('Trys to switch the theme mode to `dark`', async () => {
    const currentThemeMode = 'light' as TThemeMode;
    const switchMode = jest.fn();

    localStorage.setItem(LOCAL_STORAGE_THEME_MODE, 'dark');
    render(
      <UnconnectedThemeProvider
        switchMode={switchMode}
        themeMode={currentThemeMode}
      >
        <Children />
      </UnconnectedThemeProvider>,
    );

    expect(switchMode).toHaveBeenCalledTimes(1);
    expect(switchMode).toHaveBeenCalledWith('dark');
  });
});

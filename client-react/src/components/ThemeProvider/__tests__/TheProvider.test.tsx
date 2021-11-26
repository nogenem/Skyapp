import React from 'react';

import { render } from '@testing-library/react';

import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';
import { TThemeMode } from '~/redux/theme/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import { ThemeProvider, UnconnectedThemeProvider } from '../index';

const renderWithRedux = getRenderWithRedux();

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
    const themeModeSwitched = jest.fn();

    localStorage.setItem(LOCAL_STORAGE_THEME_MODE, 'dark');
    render(
      <UnconnectedThemeProvider
        themeModeSwitched={themeModeSwitched}
        themeMode={currentThemeMode}
      >
        <Children />
      </UnconnectedThemeProvider>,
    );

    expect(themeModeSwitched).toHaveBeenCalledTimes(1);
    expect(themeModeSwitched).toHaveBeenCalledWith('dark');
  });
});

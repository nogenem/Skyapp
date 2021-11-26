import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
  ThemeProvider as MuiThemeProvider,
  // https://stackoverflow.com/a/64135466
  // createMuiTheme,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from '@material-ui/core/styles';

import { LOCAL_STORAGE_THEME_MODE } from '~/constants/localStorageKeys';
import type { IAppState } from '~/redux/store';
import { themeModeSwitched as themeModeSwitchedAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import type { TThemeMode } from '~/redux/theme/types';

const mapStateToProps = (state: IAppState) => ({
  themeMode: getThemeMode(state),
});
const mapDispatchToProps = {
  themeModeSwitched: themeModeSwitchedAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  children: React.ReactNode;
}

type TProps = IOwnProps & TPropsFromRedux;

let prefersDarkMode = !!window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : false;
prefersDarkMode = !!prefersDarkMode ? prefersDarkMode.matches : false;

const ThemeProvider = ({ children, themeMode, themeModeSwitched }: TProps) => {
  React.useEffect(() => {
    const loadThemeMode = async () => {
      let mode = localStorage.getItem(LOCAL_STORAGE_THEME_MODE);
      if (!mode) mode = prefersDarkMode ? 'dark' : 'light';

      themeModeSwitched(mode as TThemeMode);
    };

    loadThemeMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _themeMode = themeMode || (prefersDarkMode ? 'dark' : 'light');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: {
            main: '#3f51b5',
            light: '#9cacff', // better contrast with dark background
          },
          type: _themeMode,
        },
      }),
    [_themeMode],
  );
  // (window as any).theme = theme; // TODO: Remove this later

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export type { TProps };
export const UnconnectedThemeProvider = ThemeProvider;
export default connector(ThemeProvider);

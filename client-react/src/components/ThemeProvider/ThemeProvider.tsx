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
import { switchMode as switchModeAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import type { TThemeMode } from '~/redux/theme/types';

const mapStateToProps = (state: IAppState) => ({
  themeMode: getThemeMode(state),
});
const mapDispatchToProps = {
  switchMode: switchModeAction,
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

const ThemeProvider = ({ children, themeMode, switchMode }: TProps) => {
  React.useEffect(() => {
    async function loadThemeMode() {
      let mode = localStorage.getItem(LOCAL_STORAGE_THEME_MODE);
      if (!mode) mode = prefersDarkMode ? 'dark' : 'light';

      switchMode(mode as TThemeMode);
    }
    loadThemeMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _themeMode = themeMode || (prefersDarkMode ? 'dark' : 'light');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
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

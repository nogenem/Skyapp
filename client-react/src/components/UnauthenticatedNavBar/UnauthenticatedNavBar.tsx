import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
  AppBar as MuiAppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Sync as SyncIcon,
} from '@material-ui/icons';

import type { IAppState } from '~/redux/store';
import { switchMode as switchModeAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import { getToken } from '~/redux/user/reducer';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  isAuthenticated: !!getToken(state),
  theme: getThemeMode(state),
});
const mapDispatchToProps = {
  switchMode: switchModeAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UnauthenticatedNavBar = ({
  isAuthenticated,
  theme,
  switchMode,
}: TProps) => {
  const classes = useStyles();

  const handleToggleTheme = () => {
    switchMode(theme === 'light' ? 'dark' : 'light');
  };

  if (isAuthenticated) return null;

  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap className={classes.title}>
          SkyApp
        </Typography>
        <Tooltip title="Toggle Dark/Light Theme" enterDelay={300}>
          <IconButton
            color="inherit"
            onClick={handleToggleTheme}
            aria-label="Toggle Dark/Light Theme"
            data-testid="toggle_theme_btn"
          >
            {theme === undefined && <SyncIcon />}
            {theme === 'light' && <Brightness4Icon />}
            {theme === 'dark' && <Brightness7Icon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </MuiAppBar>
  );
};

export type { TProps };
export const UnconnectedUnauthenticatedNavBar = UnauthenticatedNavBar;
export default connector(UnauthenticatedNavBar);

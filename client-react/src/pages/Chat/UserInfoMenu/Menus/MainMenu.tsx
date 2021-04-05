import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Divider,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from '@material-ui/core';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Sync as SyncIcon,
  Translate as TranslateIcon,
  ChevronRight as ChevronRightIcon,
} from '@material-ui/icons';

import { MENU_STATES, TMenuStates } from '~/constants/chat_menu_states';
import { TThemeMode } from '~/redux/theme/types';

import useStyles from './useStyles';

interface IOwnProps {
  anchorEl: Element | null;
  themeMode?: TThemeMode;
  handleSignOut: () => void;
  handleSwitchThemeMode: () => void;
  handleClose: () => void;
  setMenuState: (newState: TMenuStates) => void;
}

type TProps = IOwnProps;

const MainMenu = ({
  anchorEl,
  themeMode,
  handleSignOut,
  handleSwitchThemeMode,
  handleClose,
  setMenuState,
}: TProps) => {
  const { t: trans, i18n } = useTranslation(['Common', 'Languages']);
  const classes = useStyles();

  const handleChangingLanguage = () => {
    setMenuState(MENU_STATES.CHANGING_LANGUAGE);
  };

  return (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      id="user-info-main-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      classes={{ paper: classes.menu }}
    >
      <MenuItem classes={{ root: classes.nonInteractiveMenuItem }}>
        <div className={classes.menuHeaderContainer}>
          <Typography classes={{ root: classes.logo }}>Skyapp</Typography>
          <Button onClick={handleSignOut}>{trans('Common:Sign Out')}</Button>
        </div>
      </MenuItem>
      <Divider />
      <MenuItem classes={{ root: classes.nonInteractiveMenuItem }}>
        <ListItemIcon>
          {themeMode === undefined && <SyncIcon fontSize="small" />}
          {themeMode === 'light' && <Brightness7Icon fontSize="small" />}
          {themeMode === 'dark' && <Brightness4Icon fontSize="small" />}
        </ListItemIcon>
        <ListItemText primary={trans('Common:Theme')} />
        <ListItemSecondaryAction
          title={trans('Messages:Toggle dark/light theme')}
        >
          <Switch
            data-testid="theme_toggler"
            edge="end"
            onChange={handleSwitchThemeMode}
            checked={themeMode === 'light'}
            inputProps={{ 'aria-labelledby': 'switch-list-label-theme' }}
          />
        </ListItemSecondaryAction>
      </MenuItem>
      <MenuItem onClick={handleChangingLanguage} data-testid="lang_changer">
        <ListItemIcon>
          <TranslateIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={trans(`Languages:${i18n.language}`)} />
        <ListItemIcon classes={{ root: classes.chevronRightContainer }}>
          <ChevronRightIcon />
        </ListItemIcon>
      </MenuItem>
    </Menu>
  );
};

export type { TProps };
export default MainMenu;

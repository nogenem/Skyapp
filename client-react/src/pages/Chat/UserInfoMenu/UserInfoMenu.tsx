import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

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
} from '@material-ui/icons';

import { ChatAvatar } from '~/components';
import { IAppState } from '~/redux/store';
import { switchMode as switchModeAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import { userSignedOut as userSignedOutAction } from '~/redux/user/actions';
import { getNickname } from '~/redux/user/reducer';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  userNickname: getNickname(state),
  themeMode: getThemeMode(state),
});
const mapDispatchToProps = {
  userSignedOut: userSignedOutAction,
  switchMode: switchModeAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UserInfoMenu = ({
  userNickname,
  themeMode,
  userSignedOut,
  switchMode,
}: TProps) => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const { t: trans /*, i18n*/ } = useTranslation(['Common']);
  const classes = useStyles();

  const handleClick = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    userSignedOut();
  };

  const handleSwitchThemeMode = () => {
    switchMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const USER_THOUGHTS = 'Some status message...';
  return (
    <>
      <div className={classes.container} onClick={handleClick}>
        <ChatAvatar online />
        <div className={classes.textContainer}>
          <Typography
            component="span"
            variant="subtitle1"
            noWrap
            color="inherit"
            title={userNickname}
          >
            {userNickname}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            noWrap
            color="textSecondary"
            title={USER_THOUGHTS}
          >
            {USER_THOUGHTS}
          </Typography>
        </div>
      </div>
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
        id="user-info-menu"
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
      </Menu>
    </>
  );
};

export type { TProps };
export const UnconnectedUserInfoMenu = UserInfoMenu;
export default connector(UserInfoMenu);

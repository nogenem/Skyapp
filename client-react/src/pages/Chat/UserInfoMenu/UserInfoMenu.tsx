import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Typography } from '@material-ui/core';

import { ChatAvatar } from '~/components';
import { MENU_STATES } from '~/constants/chat_menu_states';
import type { TMenuStates } from '~/constants/chat_menu_states';
import { IAppState } from '~/redux/store';
import { switchMode as switchModeAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import { userSignedOut as userSignedOutAction } from '~/redux/user/actions';
import { getUser } from '~/redux/user/reducer';

import { MainMenu, ChangeLanguageMenu } from './Menus';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  user: getUser(state),
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
  user,
  themeMode,
  userSignedOut,
  switchMode,
}: TProps) => {
  const { i18n } = useTranslation();
  const [menuState, setMenuState] = React.useState<TMenuStates>(
    MENU_STATES.MAIN,
  );
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const classes = useStyles();

  const handleClick = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (menuState !== MENU_STATES.MAIN) {
      setMenuState(MENU_STATES.MAIN);
    }
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    userSignedOut();
  };

  const handleSwitchThemeMode = () => {
    switchMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    window.location.reload();
  };

  return (
    <>
      <div className={classes.container} onClick={handleClick}>
        <ChatAvatar online status={user.status} />
        <div className={classes.textContainer}>
          <Typography
            component="span"
            variant="subtitle1"
            noWrap
            color="inherit"
            title={user.nickname}
          >
            {user.nickname}
          </Typography>
          {!!user.thoughts && (
            <Typography
              component="span"
              variant="caption"
              noWrap
              color="textSecondary"
              title={user.thoughts}
            >
              {user.thoughts}
            </Typography>
          )}
        </div>
      </div>

      {menuState === MENU_STATES.MAIN && (
        <MainMenu
          anchorEl={anchorEl}
          themeMode={themeMode}
          handleSignOut={handleSignOut}
          handleSwitchThemeMode={handleSwitchThemeMode}
          handleClose={handleClose}
          setMenuState={setMenuState}
        />
      )}
      {menuState === MENU_STATES.CHANGING_LANGUAGE && (
        <ChangeLanguageMenu
          anchorEl={anchorEl}
          handleLanguageChange={handleLanguageChange}
          handleClose={handleClose}
          setMenuState={setMenuState}
        />
      )}
    </>
  );
};

export type { TProps };
export const UnconnectedUserInfoMenu = UserInfoMenu;
export default connector(UserInfoMenu);

import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { ListItem, Typography } from '@material-ui/core';

import { ChatAvatar } from '~/components';
import { MENU_STATES } from '~/constants/chat_menu_states';
import type { TMenuStates } from '~/constants/chat_menu_states';
import type { TUserStatus } from '~/constants/user_status';
import type { IAppState } from '~/redux/store';
import { themeModeSwitched as themeModeSwitchedAction } from '~/redux/theme/actions';
import { selectThemeMode } from '~/redux/theme/selectors';
import {
  userSignedOut as userSignedOutAction,
  sendChangeStatus as sendChangeStatusAction,
  sendChangeThoughts as sendChangeThoughtsAction,
} from '~/redux/user/actions';
import { selectUser } from '~/redux/user/selectors';

import {
  MainMenu,
  ChangeLanguageMenu,
  ChangeUserStatusMenu,
  ChangeUserThoughtsMenu,
} from './Menus';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  user: selectUser(state),
  themeMode: selectThemeMode(state),
});
const mapDispatchToProps = {
  userSignedOut: userSignedOutAction,
  themeModeSwitched: themeModeSwitchedAction,
  sendChangeStatus: sendChangeStatusAction,
  sendChangeThoughts: sendChangeThoughtsAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UserInfoMenu = ({
  user,
  themeMode,
  userSignedOut,
  themeModeSwitched,
  sendChangeStatus,
  sendChangeThoughts,
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
    themeModeSwitched(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    window.location.reload();
  };

  const handleUserStatusChange = async (status: TUserStatus) => {
    await sendChangeStatus({ newStatus: status });
    setMenuState(MENU_STATES.MAIN);
  };

  const handleUserThoughtsChange = async (newThoughts: string) => {
    await sendChangeThoughts({ newThoughts });
    setMenuState(MENU_STATES.MAIN);
  };

  return (
    <>
      <ListItem
        className={classes.container}
        onClick={handleClick}
        disableGutters
        button
      >
        <ChatAvatar online status={user.status} showInvisible />
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
      </ListItem>

      {menuState === MENU_STATES.MAIN && (
        <MainMenu
          userStatus={user.status}
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
      {menuState === MENU_STATES.CHANGING_USER_STATUS && (
        <ChangeUserStatusMenu
          userStatus={user.status}
          handleUserStatusChange={handleUserStatusChange}
          anchorEl={anchorEl}
          handleClose={handleClose}
          setMenuState={setMenuState}
        />
      )}

      {menuState === MENU_STATES.CHANGING_USER_THOUGHTS && (
        <ChangeUserThoughtsMenu
          userThoughts={user.thoughts}
          handleUserThoughtsChange={handleUserThoughtsChange}
          anchorEl={anchorEl}
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

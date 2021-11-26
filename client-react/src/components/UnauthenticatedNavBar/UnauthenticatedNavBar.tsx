import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  AppBar as MuiAppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Sync as SyncIcon,
  Translate as TranslateIcon,
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';

import { SUPPORTED_LANGUAGES } from '~/i18n';
import type { IAppState } from '~/redux/store';
import { themeModeSwitched as themeModeSwitchedAction } from '~/redux/theme/actions';
import { getThemeMode } from '~/redux/theme/reducer';
import { getToken } from '~/redux/user/reducer';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  isAuthenticated: !!getToken(state),
  theme: getThemeMode(state),
});
const mapDispatchToProps = {
  themeModeSwitched: themeModeSwitchedAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UnauthenticatedNavBar = ({
  isAuthenticated,
  theme,
  themeModeSwitched,
}: TProps) => {
  const [langMenu, setLangMenu] = React.useState<Element | null>(null);
  const { t: trans, i18n } = useTranslation(['Messages']);
  const classes = useStyles();

  const handleToggleTheme = () => {
    themeModeSwitched(theme === 'light' ? 'dark' : 'light');
  };

  const handleLanguageIconClick = (event: React.MouseEvent) => {
    setLangMenu(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLangMenu(null);
  };

  const handleLanguageChange = (lang: string) => () => {
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang);
      window.location.reload();
    } else {
      handleLanguageMenuClose();
    }
  };

  if (isAuthenticated) return null;

  const changeLangTitle = trans('Messages:Choose a language') as string;
  const toggleThemeTitle = trans('Messages:Toggle dark/light theme') as string;
  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap className={classes.title}>
          SkyApp
        </Typography>

        <Tooltip title={changeLangTitle} enterDelay={300}>
          <Button
            color="inherit"
            aria-owns={langMenu ? 'language-menu' : undefined}
            aria-haspopup="true"
            onClick={handleLanguageIconClick}
            data-testid="open_lang_menu"
          >
            <TranslateIcon />
            <Typography className={classes.language} variant="button">
              {trans(`Languages:${i18n.language}`)}
            </Typography>
            <ExpandMoreIcon fontSize="small" />
          </Button>
        </Tooltip>
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
          id="language-menu"
          anchorEl={langMenu}
          open={Boolean(langMenu)}
          onClose={handleLanguageMenuClose}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <MenuItem
              key={lang}
              onClick={handleLanguageChange(lang)}
              selected={i18n.language === lang}
            >
              <Typography>{trans(`Languages:${lang}`)}</Typography>
            </MenuItem>
          ))}
        </Menu>

        <Tooltip title={toggleThemeTitle} enterDelay={300}>
          <IconButton
            color="inherit"
            onClick={handleToggleTheme}
            aria-label={toggleThemeTitle}
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

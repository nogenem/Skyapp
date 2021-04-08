import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
} from '@material-ui/icons';

import { MENU_STATES, TMenuStates } from '~/constants/chat_menu_states';
import { SUPPORTED_LANGUAGES } from '~/i18n';

import useStyles from './useStyles';

interface IOwnProps {
  anchorEl: Element | null;
  handleLanguageChange: (lang: string) => void;
  handleClose: () => void;
  setMenuState: (newState: TMenuStates) => void;
}

type TProps = IOwnProps;

const ChangeLanguageMenu = ({
  anchorEl,
  handleLanguageChange,
  handleClose,
  setMenuState,
}: TProps) => {
  const { t: trans, i18n } = useTranslation([
    'Common',
    'Languages',
    'Messages',
  ]);
  const [selectedLang, setSelectedLang] = React.useState(i18n.language);
  const classes = useStyles();

  const handleSelectedLangChange = (lang: string) => () => {
    setSelectedLang(lang);
  };

  const handleSave = () => {
    handleLanguageChange(selectedLang);
  };

  const handleGoBack = () => {
    setMenuState(MENU_STATES.MAIN);
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
      id="user-info-change-lang-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      classes={{ paper: classes.menu }}
    >
      <MenuItem classes={{ root: classes.nonInteractiveMenuItem }}>
        <ListItemIcon title={trans('Common:Go back')}>
          <IconButton size="small" onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={trans(`Messages:Choose a language`)} />
        <ListItemSecondaryAction title={trans('Common:Done')}>
          <IconButton
            color={selectedLang === i18n.language ? 'inherit' : 'secondary'}
            disabled={selectedLang === i18n.language}
            onClick={handleSave}
            classes={{ root: classes.checkIcon }}
            data-testid="save_lang_change"
          >
            <CheckIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </MenuItem>
      <Divider />
      {SUPPORTED_LANGUAGES.map(lang => (
        <MenuItem
          key={lang}
          onClick={handleSelectedLangChange(lang)}
          selected={selectedLang === lang}
        >
          <Typography>{trans(`Languages:${lang}`)}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
};

export type { TProps };
export default ChangeLanguageMenu;

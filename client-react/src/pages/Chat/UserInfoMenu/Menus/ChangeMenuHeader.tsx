import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  IconButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
} from '@material-ui/icons';

import useStyles from './useStyles';

const defaultProps = {
  message: '',
};

interface IOwnProps {
  isDisabled: boolean;
  handleGoBack: () => void;
  handleSave: () => void;
}

type TProps = IOwnProps & Partial<typeof defaultProps>;
type Ref = HTMLLIElement;

const ChangeMenuHeader = React.forwardRef<Ref, TProps>(
  ({ message, isDisabled, handleGoBack, handleSave }: TProps, ref) => {
    const { t: trans } = useTranslation(['Common']);
    const classes = useStyles();

    return (
      <MenuItem classes={{ root: classes.nonInteractiveMenuItem }} ref={ref}>
        <ListItemIcon title={trans('Common:Go back')}>
          <IconButton size="small" onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={message} />
        <ListItemSecondaryAction title={trans('Common:Done')}>
          <IconButton
            color={isDisabled ? 'inherit' : 'secondary'}
            disabled={isDisabled}
            onClick={handleSave}
            classes={{ root: classes.checkIcon }}
            data-testid="change_menu_header_action"
          >
            <CheckIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </MenuItem>
    );
  },
);

ChangeMenuHeader.defaultProps = defaultProps;

export type { TProps };
export default ChangeMenuHeader;

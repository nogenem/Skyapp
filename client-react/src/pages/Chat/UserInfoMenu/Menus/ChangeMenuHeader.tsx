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

interface IOwnProps {
  message?: string;
  canSave?: boolean;
  handleGoBack: () => void;
  handleSave: () => void;
}

type TProps = IOwnProps;
type Ref = HTMLLIElement;

const ChangeMenuHeader = React.forwardRef<Ref, TProps>(
  (
    { message = '', canSave = false, handleGoBack, handleSave }: TProps,
    ref,
  ) => {
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
            color={!canSave ? 'inherit' : 'secondary'}
            disabled={!canSave}
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

export type { TProps };
export default ChangeMenuHeader;

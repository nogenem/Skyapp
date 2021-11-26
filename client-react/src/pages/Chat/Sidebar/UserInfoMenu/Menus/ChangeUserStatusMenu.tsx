import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { AxiosError } from 'axios';

import { Alert, UserStatusDot } from '~/components';
import type { IErrors } from '~/components/Form';
import { MENU_STATES, TMenuStates } from '~/constants/chat_menu_states';
import { USER_STATUS, USER_STATUS_2_TEXT } from '~/constants/user_status';
import type { TUserStatus } from '~/constants/user_status';
import useObjState from '~/hooks/useObjState';
import handleServerErrors from '~/utils/handleServerErrors';

import ChangeMenuHeader from './ChangeMenuHeader';
import useStyles from './useStyles';

interface IOwnState {
  selectedStatus: TUserStatus;
  loading: boolean;
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  selectedStatus: USER_STATUS.ACTIVE,
  loading: false,
  errors: {},
};

interface IOwnProps {
  userStatus: TUserStatus;
  anchorEl: Element | null;
  handleUserStatusChange: (status: TUserStatus) => Promise<void>;
  handleClose: () => void;
  setMenuState: (newState: TMenuStates) => void;
}

type TProps = IOwnProps;

const STATUS = Object.values(USER_STATUS).filter(status => status >= 0);
const ChangeUserStatusMenu = ({
  userStatus,
  anchorEl,
  handleUserStatusChange,
  handleClose,
  setMenuState,
}: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const [state, setState] = useObjState({
    ...initialState,
    selectedStatus: userStatus,
  });
  const classes = useStyles();

  const handleSelectedLangChange = (status: TUserStatus) => () => {
    setState({ selectedStatus: status });
  };

  const handleSave = async () => {
    try {
      setState({ loading: true });
      await handleUserStatusChange(state.selectedStatus);
    } catch (err) {
      console.error(err);
      setState({ loading: false });
      setState({ errors: handleServerErrors(err as AxiosError) });
    }
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
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      classes={{ paper: classes.menu }}
    >
      <ChangeMenuHeader
        message={trans(`Messages:Change status`)}
        canSave={state.selectedStatus !== userStatus && !state.loading}
        handleGoBack={handleGoBack}
        handleSave={handleSave}
      />
      <Divider />
      {(!!state.errors.global || !!state.errors.newStatus) && (
        <MenuItem classes={{ root: classes.nonInteractiveMenuItem }}>
          <Alert style={{ margin: 0 }}>
            {state.errors.global || state.errors.newStatus}
          </Alert>
        </MenuItem>
      )}
      {STATUS.map(status => (
        <MenuItem
          key={status}
          onClick={handleSelectedLangChange(status)}
          selected={state.selectedStatus === status}
        >
          <ListItemIcon>
            <UserStatusDot online status={status} showInvisible />
          </ListItemIcon>
          <ListItemText
            primary={trans(`Common:${USER_STATUS_2_TEXT[status]}`)}
          />
        </MenuItem>
      ))}
    </Menu>
  );
};

export type { TProps, TState };
export default ChangeUserStatusMenu;

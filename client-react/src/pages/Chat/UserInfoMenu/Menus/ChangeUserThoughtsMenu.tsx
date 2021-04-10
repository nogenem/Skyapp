import React from 'react';
import { useTranslation } from 'react-i18next';

import { Divider, Menu, MenuItem, TextField } from '@material-ui/core';

import { Alert } from '~/components';
import type { IErrors } from '~/components/Form';
import { MENU_STATES, TMenuStates } from '~/constants/chat_menu_states';
import useObjState from '~/hooks/useObjState';
import handleServerErrors from '~/utils/handleServerErrors';

import ChangeMenuHeader from './ChangeMenuHeader';
import useStyles from './useStyles';

interface IOwnState {
  newThoughts: string;
  loading: boolean;
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  newThoughts: '',
  loading: false,
  errors: {},
};

interface IOwnProps {
  userThoughts: string;
  anchorEl: Element | null;
  handleUserThoughtsChange: (newThoughts: string) => Promise<void>;
  handleClose: () => void;
  setMenuState: (newState: TMenuStates) => void;
}

type TProps = IOwnProps;

const ChangeUserThoughtsMenu = ({
  userThoughts,
  anchorEl,
  handleUserThoughtsChange,
  handleClose,
  setMenuState,
}: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const [state, setState] = useObjState({
    ...initialState,
    newThoughts: userThoughts,
  });
  const classes = useStyles();

  const handleThoughtsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ newThoughts: event.target.value });
  };

  const handleSave = async () => {
    try {
      setState({ loading: true });
      await handleUserThoughtsChange(state.newThoughts);
    } catch (err) {
      console.error(err);
      setState({ loading: false });
      setState({ errors: handleServerErrors(err) });
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
        message={trans(`Messages:Change your thoughts`)}
        canSave={state.newThoughts !== userThoughts && !state.loading}
        handleGoBack={handleGoBack}
        handleSave={handleSave}
      />
      <Divider />
      {!!state.errors.global && (
        <MenuItem classes={{ root: classes.nonInteractiveMenuItem }}>
          <Alert style={{ margin: 0 }}>{state.errors.global}</Alert>
        </MenuItem>
      )}
      <MenuItem>
        <TextField
          id="change-user-thoughts"
          name="newThoughts"
          label={trans('Common:Share your thoughts')}
          autoComplete="newThoughts"
          type="text"
          fullWidth
          error={!!state.errors.newThoughts}
          helperText={state.errors.newThoughts}
          variant="outlined"
          margin="normal"
          value={state.newThoughts}
          onChange={handleThoughtsChange}
          classes={{ root: classes.changeThoughtsInput }}
        />
      </MenuItem>
    </Menu>
  );
};

export type { TProps };
export default ChangeUserThoughtsMenu;

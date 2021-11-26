import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
} from '@material-ui/core';
import debounce from 'lodash.debounce';

import { Alert, ChatAvatar, TextInput } from '~/components';
import type { IErrors } from '~/components/Form';
import useObjState from '~/hooks/useObjState';
import { IOtherUser } from '~/redux/chat/types';

import useStyles from './useStyles';

const FORM_ID = 'group-info-modal-form';

interface IOwnState {
  filter: string;
  filteredUsers: IOtherUser[];
  isAdminObj: { [_id: string]: boolean };
}
type TState = IOwnState;

const initialState: TState = {
  filter: '',
  filteredUsers: [],
  isAdminObj: {},
};

interface IOwnProps {
  groupName: string;
  selectedUsersObj: { [_id: string]: boolean };
  isAdminObj: { [_id: string]: boolean };
  errors: IErrors;
  isLoggedUserAdmin: boolean;
  users: IOtherUser[];
  setGroupName: (name: string) => void;
  toggleUserSelected: (userId: string) => void;
  toggleUserIsAdmin: (userId: string) => void;
}

type TProps = IOwnProps;

const Form = ({
  groupName,
  selectedUsersObj,
  isAdminObj,
  errors,
  isLoggedUserAdmin,
  users,
  setGroupName,
  toggleUserSelected,
  toggleUserIsAdmin,
}: TProps) => {
  const [state, setState] = useObjState({
    ...initialState,
    filteredUsers: users,
  });
  const isMounted = React.useRef(false);
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const updateFilteredUsers = (filter: string, users: IOtherUser[]) => {
    if (isMounted.current) {
      if (!filter) {
        setState({ filteredUsers: users });
      } else {
        const toSeach = filter.toLowerCase();
        setState({
          filteredUsers: users.filter(user =>
            user.nickname.toLowerCase().includes(toSeach),
          ),
        });
      }
    }
  };

  const debouncedUpdateFilteredUsers = React.useCallback(
    debounce(updateFilteredUsers, 250),
    [],
  );

  const onFilterChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      filter: evt.target.value,
    });
  };

  const handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoggedUserAdmin) {
      setGroupName(evt.target.value);
    }
  };

  const handleCheckboxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoggedUserAdmin) {
      toggleUserSelected(evt.target.name);
    }
  };

  const handleIsAdminChange = (userId: string) => () => {
    if (isLoggedUserAdmin) {
      toggleUserIsAdmin(userId);
    }
  };

  const renderUsers = () =>
    state.filteredUsers.map(user => (
      <FormControlLabel
        key={user._id}
        control={
          <Checkbox
            name={user._id}
            onChange={handleCheckboxChange}
            checked={!!selectedUsersObj[user._id]}
          />
        }
        label={
          <Label
            user={user}
            isAdmin={!!isAdminObj[user._id]}
            onClick={handleIsAdminChange(user._id)}
            disabled={!isLoggedUserAdmin}
          />
        }
        labelPlacement="start"
        className={classes.checkboxWrapper}
        disabled={!isLoggedUserAdmin}
      />
    ));

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    debouncedUpdateFilteredUsers(state.filter, users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter, users]);

  return (
    <form>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextInput
        id={`${FORM_ID}-name`}
        name="name"
        label={trans('Common:Group Name')}
        type="text"
        fullWidth
        required
        error={!!errors.name}
        helperText={trans(errors.name)}
        variant="outlined"
        margin="normal"
        value={groupName}
        onChange={handleNameChange}
        disabled={!isLoggedUserAdmin}
      />

      <FormControl
        id="members_wrapper"
        component="fieldset"
        className={classes.formControl}
        error={!!errors.members}
      >
        <FormLabel component="legend" className={classes.formLegend}>
          {trans('Messages:Select Members')}
        </FormLabel>

        <TextInput
          id={`${FORM_ID}-filter`}
          name="filter"
          label={trans('Common:Filter')}
          type="text"
          fullWidth
          style={{ marginTop: '5px' }}
          margin="normal"
          onChange={onFilterChange}
          disabled={!isLoggedUserAdmin}
        />

        <FormHelperText error={false}>
          {trans("Messages:Click on user's image to toggle admin status")}
        </FormHelperText>
        <FormGroup className={classes.formGroup}>{renderUsers()}</FormGroup>
        <FormHelperText className={classes.formHelperText}>
          {trans(errors.members)}
        </FormHelperText>
      </FormControl>
    </form>
  );
};

interface ILabelProps {
  user: IOtherUser;
  isAdmin: boolean;
  disabled: boolean;
  onClick: () => void;
}

const Label = ({ user, isAdmin, disabled, onClick }: ILabelProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const tooltip = trans(isAdmin ? 'Common:Admin' : 'Messages:Turn into Admin');
  const color = isAdmin ? 'secondary' : 'inherit';

  return (
    <span className={classes.checkboxLabel}>
      <Tooltip title={tooltip} classes={{ tooltip: classes.tooltip }} arrow>
        <span>
          <IconButton
            aria-label={tooltip}
            onClick={onClick}
            color={color}
            disabled={disabled}
          >
            <ChatAvatar
              online={user.online}
              status={user.status}
              color={color}
            />
          </IconButton>
        </span>
      </Tooltip>
      <span>{user.nickname}</span>
    </span>
  );
};

export type { TProps, TState };
export default Form;

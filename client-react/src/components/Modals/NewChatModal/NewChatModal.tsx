import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core';
import { AxiosError } from 'axios';
import debounce from 'lodash.debounce';

import { ChatAvatar, Alert, TextInput } from '~/components';
import useObjState from '~/hooks/useObjState';
import { startChattingWith as startChattingWithAction } from '~/redux/chat/actions';
import { getUsersWithoutChannelArray } from '~/redux/chat/reducer';
import type { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import handleServerErrors, { IErrors } from '~/utils/handleServerErrors';

import useStyles from './useStyles';

interface IOwnState {
  filteredUsers: IOtherUser[];
  search: string;
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  filteredUsers: [],
  search: '',
  errors: {},
};

const mapStateToProps = (state: IAppState) => ({
  users: getUsersWithoutChannelArray(state),
});
const mapDispatchToProps = {
  startChattingWith: startChattingWithAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  isOpen: boolean;
  onClose: () => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const NewChatModal = ({
  isOpen,
  onClose,
  users,
  startChattingWith,
}: TProps) => {
  const [state, setState] = useObjState({
    ...initialState,
    filteredUsers: users,
  });
  const isMounted = React.useRef(false);
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const updateFilteredUsers = (search: string, users: IOtherUser[]) => {
    if (isMounted.current) {
      if (!search) {
        setState({ filteredUsers: users });
      } else {
        const toSeach = search.toLowerCase();
        setState({
          filteredUsers: users.filter(
            user =>
              user.nickname.toLowerCase().includes(toSeach) ||
              user.thoughts.toLowerCase().includes(toSeach),
          ),
        });
      }
    }
  };

  const debouncedOnSearchChange = React.useCallback(
    debounce(updateFilteredUsers, 250),
    [],
  );

  const onSearchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState({ search: evt.target.value });
  };

  const handleConfirm = async (user: IOtherUser) => {
    try {
      await startChattingWith(user);
      onClose();
    } catch (err) {
      setState({ errors: handleServerErrors(err as AxiosError) });
    }
  };

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    debouncedOnSearchChange(state.search, users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search, users]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="new-chat-modal-title"
      fullWidth
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="new-chat-modal-title">
        {trans('Messages:Chat with someone')}
      </DialogTitle>

      <DialogContent dividers>
        {state.errors.global && (
          <Alert className={classes.noMargin}>{state.errors.global}</Alert>
        )}

        {users.length > 0 && (
          <TextInput
            name="search"
            label={trans('Common:Search')}
            type="text"
            fullWidth
            variant="outlined"
            margin="normal"
            onChange={onSearchChange}
            value={state.search}
          />
        )}

        {state.filteredUsers.length > 0 && (
          <List>
            {state.filteredUsers.map(user => (
              <ListItem
                button
                onClick={() => handleConfirm(user)}
                key={user._id}
              >
                <ListItemAvatar className={classes.listAvatar}>
                  <ChatAvatar online={user.online} status={user.status} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.nickname}
                  secondary={user.thoughts}
                />
              </ListItem>
            ))}
          </List>
        )}

        {state.filteredUsers.length === 0 && !!state.search && (
          <DialogContentText className={classes.noMargin}>
            {trans('Messages:No user found')}
          </DialogContentText>
        )}

        {users.length === 0 && (
          <DialogContentText className={classes.noMargin}>
            {trans('Messages:You are already chatting with EVERYONE!')}
          </DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
};

export type { TProps };
export const UnconnectedNewChatModal = NewChatModal;
export default connector(NewChatModal);

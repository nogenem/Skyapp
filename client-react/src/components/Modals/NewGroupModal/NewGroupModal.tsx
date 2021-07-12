import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

import { IErrors } from '~/components/Form';
import { CANT_BE_BLANK, NEED_ATLEAST_2_MEMBERS } from '~/constants/errors';
import useObjState from '~/hooks/useObjState';
import { createGroupChannel as createGroupChannelAction } from '~/redux/chat/actions';
import { getUsersArray } from '~/redux/chat/reducer';
import { INewGroupCredentials } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import handleServerErrors from '~/utils/handleServerErrors';

import { Form } from './Form';

interface IOwnState {
  groupName: string;
  selectedUsersObj: { [_id: string]: boolean };
  isAdminObj: { [_id: string]: boolean };
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  groupName: '',
  selectedUsersObj: {},
  isAdminObj: {},
  errors: {},
};

const mapStateToProps = (state: IAppState) => ({
  users: getUsersArray(state),
});
const mapDispatchToProps = {
  createGroupChannel: createGroupChannelAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  isOpen: boolean;
  onClose: () => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const NewGroupModal = ({
  isOpen,
  onClose,
  users,
  createGroupChannel,
}: TProps) => {
  const [state, setState] = useObjState(initialState);
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const validate = () => {
    const errors = {} as IErrors;

    if (!state.groupName) errors.name = CANT_BE_BLANK;
    if (
      Object.values(state.selectedUsersObj).filter(isSelected => isSelected)
        .length < 2
    )
      errors.members = NEED_ATLEAST_2_MEMBERS;

    return errors;
  };

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  const handleConfirm = async () => {
    const errors = validate();

    if (Object.keys(errors).length >= 1) {
      setState({
        errors,
      });
    } else {
      const credentials = {
        name: state.groupName,
        members: [],
        admins: [],
      } as INewGroupCredentials;

      Object.entries(state.selectedUsersObj).forEach(([userId, isSelected]) => {
        if (isSelected) {
          credentials.members.push(userId);
          if (state.isAdminObj[userId]) {
            credentials.admins.push(userId);
          }
        }
      });

      try {
        await createGroupChannel(credentials);
        setState(initialState);
        onClose();
      } catch (err) {
        setState({ errors: handleServerErrors(err) });
      }
    }
  };

  const setGroupName = (name: string) => {
    setState({
      groupName: name,
    });
  };

  const toggleUserSelected = (userId: string) => {
    setState(prev => ({
      selectedUsersObj: {
        ...prev.selectedUsersObj,
        [userId]: !prev.selectedUsersObj[userId],
      },
    }));
  };

  const toggleUserIsAdmin = (userId: string) => {
    setState(prev => ({
      isAdminObj: {
        ...prev.isAdminObj,
        [userId]: !prev.isAdminObj[userId],
      },
    }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="new-group-modal-title"
      fullWidth
    >
      <DialogTitle id="new-group-modal-title">
        {trans('Messages:Create a group')}
      </DialogTitle>

      <DialogContent dividers>
        <Form
          groupName={state.groupName}
          selectedUsersObj={state.selectedUsersObj}
          isAdminObj={state.isAdminObj}
          errors={state.errors}
          setGroupName={setGroupName}
          toggleUserSelected={toggleUserSelected}
          toggleUserIsAdmin={toggleUserIsAdmin}
          users={users}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="default">
          {trans('Common:Cancel')}
        </Button>
        <Button onClick={handleConfirm} color="secondary" autoFocus>
          {trans('Common:Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export type { TProps };
export const UnconnectedNewGroupModal = NewGroupModal;
export default connector(NewGroupModal);

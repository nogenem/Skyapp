import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import { AxiosError } from 'axios';

import type { IErrors } from '~/components/Form';
import { CANT_BE_BLANK, NEED_ATLEAST_2_MEMBERS } from '~/constants/errors';
import useObjState from '~/hooks/useObjState';
import { sendCreateGroupChannel as sendCreateGroupChannelAction } from '~/redux/chat/actions';
import { selectChatUsersList } from '~/redux/chat/selectors';
import type { IAppState } from '~/redux/store';
import type { IStoreGroupChannelRequestBody } from '~/requestsParts/channel';
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
  users: selectChatUsersList(state),
});
const mapDispatchToProps = {
  sendCreateGroupChannel: sendCreateGroupChannelAction,
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
  sendCreateGroupChannel,
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

  const handleClose = (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();

    setState(initialState);
    onClose();
  };

  const handleConfirm = async (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();

    const errors = validate();

    if (Object.keys(errors).length >= 1) {
      setState({
        errors,
      });
    } else {
      const data = {
        name: state.groupName,
        members: [],
        admins: [],
      } as IStoreGroupChannelRequestBody;

      Object.entries(state.selectedUsersObj).forEach(([userId, isSelected]) => {
        if (isSelected) {
          data.members.push(userId);
          if (state.isAdminObj[userId]) {
            data.admins.push(userId);
          }
        }
      });

      try {
        await sendCreateGroupChannel(data);
        setState(initialState);
        onClose();
      } catch (err) {
        setState({ errors: handleServerErrors(err as AxiosError) });
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

export type { TProps, TState };
export const UnconnectedNewGroupModal = NewGroupModal;
export default connector(NewGroupModal);

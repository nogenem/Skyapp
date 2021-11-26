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

import { IErrors } from '~/components/Form';
import { CANT_BE_BLANK, NEED_ATLEAST_2_MEMBERS } from '~/constants/errors';
import useObjState from '~/hooks/useObjState';
import { sendUpdateGroupChannel as sendUpdateGroupChannelAction } from '~/redux/chat/actions';
import { getUsersArray } from '~/redux/chat/reducer';
import { IChannel, IUpdateGroupCredentials } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import { getId } from '~/redux/user/reducer';
import handleServerErrors from '~/utils/handleServerErrors';

import { Form } from './Form';

interface IOwnState {
  groupName: string;
  selectedUsersObj: { [_id: string]: boolean };
  isAdminObj: { [_id: string]: boolean };
  errors: IErrors;
  isLoggedUserAdmin: boolean;
}
type TState = IOwnState;

const initialState: TState = {
  groupName: '',
  selectedUsersObj: {},
  isAdminObj: {},
  errors: {},
  isLoggedUserAdmin: false,
};

const mapStateToProps = (state: IAppState) => ({
  users: getUsersArray(state),
  loggedUserId: getId(state),
});
const mapDispatchToProps = {
  sendUpdateGroupChannel: sendUpdateGroupChannelAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  isOpen: boolean;
  channel: IChannel;
  onClose: () => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const GroupInfoModal = ({
  isOpen,
  channel,
  onClose,
  users,
  loggedUserId,
  sendUpdateGroupChannel,
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

    if (!state.isLoggedUserAdmin) return false;

    const errors = validate();

    if (Object.keys(errors).length >= 1) {
      setState({
        errors,
      });
    } else {
      const credentials = {
        channel_id: channel._id,
        name: state.groupName,
        members: [],
        admins: [],
      } as IUpdateGroupCredentials;

      Object.entries(state.selectedUsersObj).forEach(([userId, isSelected]) => {
        if (isSelected) {
          credentials.members.push(userId);
          if (state.isAdminObj[userId]) {
            credentials.admins.push(userId);
          }
        }
      });

      try {
        await sendUpdateGroupChannel(credentials);
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

  React.useEffect(() => {
    if (isOpen) {
      const newState = {
        groupName: channel.name,
        selectedUsersObj: {} as { [_id: string]: boolean },
        isAdminObj: {} as { [_id: string]: boolean },
        isLoggedUserAdmin: false,
      };

      if (!!channel.members) {
        channel.members.forEach(member => {
          newState.selectedUsersObj[member.user_id] = true;
          newState.isAdminObj[member.user_id] = member.is_adm;
          if (member.user_id === loggedUserId && member.is_adm)
            newState.isLoggedUserAdmin = true;
        });
      }

      setState(newState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUserId, channel, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="group-info-modal-title"
      fullWidth
    >
      <DialogTitle id="group-info-modal-title">
        {trans('Messages:Group Info')}
      </DialogTitle>

      <DialogContent dividers>
        <Form
          groupName={state.groupName}
          selectedUsersObj={state.selectedUsersObj}
          isAdminObj={state.isAdminObj}
          errors={state.errors}
          isLoggedUserAdmin={state.isLoggedUserAdmin}
          setGroupName={setGroupName}
          toggleUserSelected={toggleUserSelected}
          toggleUserIsAdmin={toggleUserIsAdmin}
          users={users}
        />
      </DialogContent>

      <DialogActions>
        {state.isLoggedUserAdmin ? (
          <>
            <Button onClick={handleClose} color="default">
              {trans('Common:Cancel')}
            </Button>
            <Button onClick={handleConfirm} color="secondary" autoFocus>
              {trans('Common:Confirm')}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} color="default">
            {trans('Common:Close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export type { TProps, TState };
export const UnconnectedGroupInfoModal = GroupInfoModal;
export default connector(GroupInfoModal);

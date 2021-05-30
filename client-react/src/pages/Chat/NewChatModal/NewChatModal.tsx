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

import { ChatAvatar, Alert } from '~/components';
import { startChattingWith as startChattingWithAction } from '~/redux/chat/actions';
import { getUsersWithoutChannelArray } from '~/redux/chat/reducer';
import type { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import handleServerErrors, { IErrors } from '~/utils/handleServerErrors';

import useStyles from './useStyles';

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
  const [errors, setErrors] = React.useState<IErrors | null>(null);
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const handleConfirm = async (user: IOtherUser) => {
    try {
      await startChattingWith(user);
      onClose();
    } catch (err) {
      setErrors(handleServerErrors(err));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="new-chat-modal-title"
      fullWidth
    >
      <DialogTitle id="new-chat-modal-title">
        {trans('Messages:Chat with someone')}
      </DialogTitle>

      {errors && errors.global && <Alert>{errors.global}</Alert>}

      {users.length ? (
        <List>
          {users.map(user => (
            <ListItem button onClick={() => handleConfirm(user)} key={user._id}>
              <ListItemAvatar className={classes.listAvatar}>
                <ChatAvatar online={user.online} status={user.status} />
              </ListItemAvatar>
              <ListItemText primary={user.nickname} secondary={user.thoughts} />
            </ListItem>
          ))}
        </List>
      ) : null}
      {!users.length ? (
        <DialogContent>
          <DialogContentText>
            {trans('Messages:You are already chatting with EVERYONE!')}
          </DialogContentText>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};

export type { TProps };
export const UnconnectedNewChatModal = NewChatModal;
export default connector(NewChatModal);

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { ListItem, ListItemText } from '@material-ui/core';

import { ChatAvatar } from '~/components';
import { USER_STATUS } from '~/constants/user_status';
import { setActiveChannel as setActiveChannelAction } from '~/redux/chat/actions';
import { getOtherUserFromChannel } from '~/redux/chat/reducer';
import { IChannel } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState, props: IOwnProps) => ({
  otherUser: getOtherUserFromChannel(state, props),
});
const mapDispatchToProps = {
  setActiveChannel: setActiveChannelAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  channel: IChannel;
  selected: boolean;
}

type TProps = TPropsFromRedux & IOwnProps;

const ChatListItem = ({
  channel,
  selected,
  otherUser,
  setActiveChannel,
}: TProps) => {
  const classes = useStyles();

  const handleListClick = () => {
    setActiveChannel(channel._id);
  };

  return (
    <ListItem button selected={selected} onClick={handleListClick}>
      <div className={classes.avatarContainer}>
        <ChatAvatar
          online={otherUser === undefined || !!otherUser?.online}
          status={otherUser?.status || USER_STATUS.ACTIVE}
        />
      </div>
      <ListItemText primary={channel.name} />
    </ListItem>
  );
};

export type { TProps };
export const UnconnectedChatListItem = ChatListItem;
export default connector(ChatListItem);

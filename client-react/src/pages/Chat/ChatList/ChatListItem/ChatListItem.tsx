import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  Badge,
  Divider,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import {
  InsertDriveFile as InsertDriveFileIcon,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';

import { ChatAvatar } from '~/components';
import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
import { setActiveChannel as setActiveChannelAction } from '~/redux/chat/actions';
import { getOtherUserFromChannel } from '~/redux/chat/reducer';
import type { IAttachment, IChannel, IMessage } from '~/redux/chat/types';
import type { IAppState } from '~/redux/store';
import sanitize from '~/utils/sanitize';

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
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const { t: trans } = useTranslation(['Common']);
  const isMenuOpen = Boolean(anchorEl);
  const classes = useStyles();

  const handleListClick = () => {
    setActiveChannel(channel._id);
  };

  const handleOptionsClick = (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget as Element);
  };

  const handleMenuClose = (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleInfoClick = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    // TODO
  };

  const handleLeaveClick = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    // TODO
  };

  return (
    <ListItem button selected={selected} onClick={handleListClick}>
      <div className={classes.avatarContainer}>
        <ChatAvatar
          online={otherUser === undefined || !!otherUser?.online}
          status={otherUser?.status || USER_STATUS.ACTIVE}
          isGroup={channel.is_group}
        />
      </div>
      <ListItemText
        primary={
          <PrimaryText name={channel.name} lastMessage={channel.lastMessage} />
        }
        secondary={
          <SecondaryText
            lastMessage={channel.lastMessage}
            unreadMsgs={channel.unread_msgs}
          />
        }
      />
      {channel.is_group && (
        <>
          <Menu
            id={`cli-menu-${channel._id}`}
            anchorEl={anchorEl}
            keepMounted
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleInfoClick}>
              {trans('Common:Info')}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLeaveClick}>
              {trans('Common:Leave')}
            </MenuItem>
          </Menu>
        </>
      )}
      {channel.is_group && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="options"
            aria-controls={`cli-menu-${channel._id}`}
            aria-haspopup="true"
            onClick={handleOptionsClick}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

interface IPrimaryText {
  name: string;
  lastMessage?: IMessage;
}

const PrimaryText = ({ name, lastMessage }: IPrimaryText) => {
  const classes = useStyles();

  const date =
    lastMessage && lastMessage.updatedAt
      ? lastMessage.updatedAt.toLocaleDateString()
      : '';

  return (
    <span className={classes.textContainer} title={name}>
      <Typography
        component="span"
        variant="body2"
        display="inline"
        color="textPrimary"
        noWrap
      >
        {name}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        display="inline"
        color="inherit"
      >
        {date}
      </Typography>
    </span>
  );
};

interface ISecondaryText {
  lastMessage?: IMessage;
  unreadMsgs: number;
}

const SecondaryText = ({ lastMessage, unreadMsgs }: ISecondaryText) => {
  const classes = useStyles();
  let message = undefined;
  let title = '';

  if (!!lastMessage) {
    if (
      lastMessage.type === undefined ||
      lastMessage.type === MESSAGE_TYPES.TEXT
    ) {
      message = lastMessage.body as string;
      title = message;
    } else if (
      lastMessage.type === MESSAGE_TYPES.UPLOADED_FILE ||
      lastMessage.type === MESSAGE_TYPES.UPLOADED_AUDIO
    ) {
      const body = lastMessage.body as IAttachment;
      const name = sanitize(body.originalName);
      message = (
        <>
          <InsertDriveFileIcon className={classes.secondaryTextIcon} /> {name}
        </>
      );
      title = name;
    }
  }

  return (
    <span className={classes.textContainer} title={title}>
      <Typography
        component="span"
        variant="body2"
        display="inline"
        color="textSecondary"
        noWrap
        className={classes.secondaryText}
      >
        {message}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        display="inline"
        color="inherit"
      >
        <Badge
          className={classes.unreadBadge}
          badgeContent={unreadMsgs}
          color="primary"
        />
      </Typography>
    </span>
  );
};

export type { TProps };
export const UnconnectedChatListItem = ChatListItem;
export default connector(ChatListItem);

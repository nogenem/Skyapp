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
import { AxiosError } from 'axios';

import { ChatAvatar, GroupInfoModal, AreYouSureModal } from '~/components';
import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
import useObjState from '~/hooks/useObjState';
import {
  emitSetActiveChannel as emitSetActiveChannelAction,
  sendLeaveGroupChannel as sendLeaveGroupChannelAction,
} from '~/redux/chat/actions';
import {
  selectChatChannelById,
  selectOtherUserFromChannel,
} from '~/redux/chat/selectors';
import type { IAttachment, IChannel, IMessage } from '~/redux/chat/types';
import type { IAppState } from '~/redux/store';
import handleServerErrors, { IErrors } from '~/utils/handleServerErrors';

import useStyles from './useStyles';

interface IOwnState {
  isGroupInfoModalOpen: boolean;
  isLeaveGroupModalOpen: boolean;
  leaveGroupModalErrors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  isGroupInfoModalOpen: false,
  isLeaveGroupModalOpen: false,
  leaveGroupModalErrors: {},
};

const mapStateToProps = (state: IAppState, props: IOwnProps) => ({
  otherUser: selectOtherUserFromChannel(state, props),
  channel: selectChatChannelById(state, props) as IChannel,
});
const mapDispatchToProps = {
  emitSetActiveChannel: emitSetActiveChannelAction,
  sendLeaveGroupChannel: sendLeaveGroupChannelAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  channelId: string;
  selected: boolean;
}

type TProps = TPropsFromRedux & IOwnProps;

const ChatListItem = ({
  channelId,
  selected,
  otherUser,
  channel,
  emitSetActiveChannel,
  sendLeaveGroupChannel,
}: TProps) => {
  const [state, setState] = useObjState(initialState);
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const isMounted = React.useRef(false);
  const { t: trans } = useTranslation(['Common']);
  const isMenuOpen = Boolean(anchorEl);
  const classes = useStyles();

  const handleListClick = () => {
    emitSetActiveChannel(channel._id);
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
    setState({
      isGroupInfoModalOpen: true,
    });
  };

  const handleLeaveClick = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    setState({
      isLeaveGroupModalOpen: true,
    });
  };

  const onGroupInfoModalClose = () => {
    setState({
      isGroupInfoModalOpen: false,
    });
  };

  const onLeaveGroupModalClose = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    setState({
      isLeaveGroupModalOpen: false,
    });
  };

  const onLeaveGroupModalConfirm = async (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    try {
      await sendLeaveGroupChannel({ channelId: channel._id });
      onLeaveGroupModalClose(event);
    } catch (err) {
      setState({
        leaveGroupModalErrors: handleServerErrors(err as AxiosError),
      });
    }
  };

  React.useEffect(() => {
    if (isMounted.current && channel.lastMessage && !selected) {
      new Audio('/skype_message_sound.mp3').play();
    }

    if (!isMounted.current) isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.lastMessage]);

  return (
    <>
      <ListItem button selected={selected} onClick={handleListClick}>
        <div className={classes.avatarContainer}>
          <ChatAvatar
            online={otherUser === undefined || !!otherUser?.online}
            status={otherUser?.status || USER_STATUS.ACTIVE}
            isGroup={channel.isGroup}
          />
        </div>
        <ListItemText
          primary={
            <PrimaryText
              name={channel.name}
              lastMessage={channel.lastMessage}
            />
          }
          secondary={
            <SecondaryText
              lastMessage={channel.lastMessage}
              unreadMsgs={channel.unreadMsgs}
            />
          }
        />
        {channel.isGroup && (
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
        )}
        {channel.isGroup && (
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
      {channel.isGroup && (
        <>
          <GroupInfoModal
            isOpen={state.isGroupInfoModalOpen}
            onClose={onGroupInfoModalClose}
            channel={channel}
          />
          <AreYouSureModal
            isOpen={state.isLeaveGroupModalOpen}
            body="Messages:Are you sure you want to leave this group?"
            errors={state.leaveGroupModalErrors}
            onConfirm={onLeaveGroupModalConfirm}
            onClose={onLeaveGroupModalClose}
          />
        </>
      )}
    </>
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
    } else if (lastMessage.type === MESSAGE_TYPES.UPLOADED_FILE) {
      const body = lastMessage.body as IAttachment;
      const name = body.originalName;
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

export type { TProps, TState };
export const UnconnectedChatListItem = ChatListItem;
export default connector(ChatListItem);

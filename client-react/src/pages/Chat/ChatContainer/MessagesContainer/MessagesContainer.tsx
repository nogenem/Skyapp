import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import {
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from '@material-ui/core';
import {
  AccountCircle as AccountCircleIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
} from '@material-ui/icons';

import { AreYouSureModal } from '~/components';
import { MESSAGE_TYPES } from '~/constants/message_types';
import type { TMessageType } from '~/constants/message_types';
import useObjState from '~/hooks/useObjState';
import useScrollState, { EScrollStates } from '~/hooks/useScrollState';
import { selectActiveChannel } from '~/redux/chat/selectors';
import type { IAttachment, IMessage, IOtherUsers } from '~/redux/chat/types';
import type { IAppState } from '~/redux/store';
import type { IUser } from '~/redux/user/types';

import {
  DateMessage,
  NewMsgsMessage,
  SystemMessage,
  TextMessage,
  UploadedFileMessage,
  UploadedImageMessage,
} from './Messages';
import AudioMessage from './Messages/AudioMessage';
import useStyles from './useStyles';

interface IHoveringMsgInfo {
  _id: string;
  type?: TMessageType;
  top: number;
  left: number;
}

const initialHoveringMsgInfo: IHoveringMsgInfo = {
  _id: '',
  type: undefined,
  top: -1,
  left: -1,
};

const mapStateToProps = (state: IAppState) => ({
  activeChannel: selectActiveChannel(state),
});

const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  messages: IMessage[];
  messagesQueue: IMessage[];
  loggedUser: IUser;
  users: IOtherUsers;
  onScrollTop: () => Promise<void>;
  changeEditingMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const MessagesContainer = ({
  messages,
  messagesQueue,
  loggedUser,
  users,
  onScrollTop,
  changeEditingMessage,
  onDeleteMessage,
  activeChannel,
}: TProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const scrollState = useScrollState(ref.current);
  const [isDeleteMessageModalOpen, setIsDeleteMessageModalOpen] =
    React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const [hoveringMsgInfo, setHoveringMsgInfo] = useObjState(
    initialHoveringMsgInfo,
  );

  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const channelId = messages[0]?.channelId;
  const isMenuOpen = Boolean(anchorEl);

  const handleOnMouseEnter =
    (messageId: string, messageType: TMessageType) =>
    (event: MouseEvent<Element>) => {
      const element = event.target as HTMLElement;
      setHoveringMsgInfo({
        _id: messageId,
        type: messageType,
        top: element.offsetTop,
        left: element.offsetLeft + element.clientWidth,
      });
    };

  const renderMessage = (
    message: IMessage,
    shouldShowUserInfo: boolean = false,
    isQueuedMessage: boolean = false,
  ) => {
    const isFromLoggedUser = message.fromId === loggedUser._id;
    const wrapperExtraClassName = isFromLoggedUser
      ? classes.messageWrapperFromMe
      : classes.messageWrapperFromThem;
    const msgClassName = isFromLoggedUser
      ? classes.messageFromMe
      : classes.messageFromThem;
    const infoClassName = isFromLoggedUser ? classes.myInfo : classes.theirInfo;

    let progressTitle = '';
    if (isQueuedMessage) progressTitle = trans('Messages:Sending the message');
    else if (message.isUpdating)
      progressTitle = trans('Messages:Updating this message');
    else if (message.isDeleting)
      progressTitle = trans('Messages:Deleting this message');

    const user = users[message.fromId || ''] || loggedUser;
    const nickname = getFirstName(user.nickname);
    const date = getTime(message.createdAt);

    const onMouseEnter =
      isFromLoggedUser && !isQueuedMessage
        ? handleOnMouseEnter(message._id, message.type)
        : undefined;

    return (
      <React.Fragment key={message._id}>
        {shouldShowUserInfo && (
          <div className={infoClassName}>
            {isFromLoggedUser ? date : `${nickname}, ${date}`}
          </div>
        )}
        <div
          className={`${classes.messageWrapper} ${wrapperExtraClassName}`}
          onMouseEnter={onMouseEnter}
        >
          <Paper className={msgClassName}>
            {shouldShowUserInfo && !isFromLoggedUser && (
              <AccountCircleIcon className={classes.user_icon} />
            )}

            {getMessageByType(message)}
          </Paper>
          {(isQueuedMessage || message.isUpdating || message.isDeleting) && (
            <CircularProgress
              title={progressTitle}
              color="secondary"
              thickness={4}
              className={classes.loading_icon}
            />
          )}
          {message.createdAt.getTime() !== message.updatedAt.getTime() && (
            <span
              className={classes.edited_icon}
              title={trans('Messages:This message was edited')}
            >
              <EditIcon fontSize="small" />
            </span>
          )}
        </div>
      </React.Fragment>
    );
  };

  const renderMessages = () => {
    const ret = [];
    let lastDate: Date | undefined = undefined;
    let lastUserId: string | undefined = undefined;
    let addedOtherLastSeen: boolean = false;
    let addedNewMsgsAlert: boolean = false;

    const myLastSeen = !activeChannel?.isGroup
      ? activeChannel?.members.find(member => member.userId === loggedUser._id)
          ?.lastSeen
      : undefined;
    const otherLastSeen = !activeChannel?.isGroup
      ? activeChannel?.members.find(member => member.userId !== loggedUser._id)
          ?.lastSeen
      : undefined;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      let addedDate = false;

      // Add date message
      if (!lastDate || lastDate.getDate() !== message.createdAt.getDate()) {
        ret.push(
          <DateMessage
            key={`${message._id}_${message.createdAt}`}
            date={message.createdAt}
          />,
        );
        addedDate = true;
      }

      // Add 'other user' icon to demostrate his/her last seen message
      if (
        !addedOtherLastSeen &&
        otherLastSeen &&
        otherLastSeen < message.createdAt
      ) {
        ret.push(
          <AccountCircleIcon
            key="lastSeen"
            className={classes.last_seen_icon}
          />,
        );
        addedOtherLastSeen = true;
      }

      // Add 'new messages' message
      if (
        !addedNewMsgsAlert &&
        myLastSeen &&
        myLastSeen < message.createdAt &&
        message.fromId !== loggedUser._id
      ) {
        ret.push(<NewMsgsMessage key="new_messages" />);
        addedNewMsgsAlert = true;
      }

      if (!message.fromId) {
        ret.push(<SystemMessage key={message._id} message={message} />);
      } else {
        const isOtherTime =
          lastDate &&
          (lastDate.getHours() !== message.createdAt.getHours() ||
            Math.abs(lastDate.getMinutes() - message.createdAt.getMinutes()) >=
              5);
        const shouldShowUserInfo =
          lastUserId !== message.fromId || addedDate || isOtherTime;
        ret.push(renderMessage(message, shouldShowUserInfo));
      }

      lastDate = message.createdAt;
      lastUserId = message.fromId;
    }

    // Add 'other user' icon to demostrate his/her last seen message
    if (!addedOtherLastSeen && otherLastSeen && messages.length) {
      ret.push(
        <AccountCircleIcon key="lastSeen" className={classes.last_seen_icon} />,
      );
    }
    return ret;
  };

  const renderQueue = () => {
    const ret = [];
    for (let i = 0; i < messagesQueue.length; i++) {
      const message = messagesQueue[i];
      ret.push(renderMessage(message, false, true));
    }
    return ret;
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

  const handleEditClick = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    changeEditingMessage(hoveringMsgInfo._id);
  };

  const handleDeleteClick = (event: MouseEvent<Element>) => {
    handleMenuClose(event);
    setIsDeleteMessageModalOpen(true);
  };

  const onDeleteMessageModalClose = () => {
    setIsDeleteMessageModalOpen(false);
  };

  const onDeleteMessageModalConfirm = () => {
    const messageId = hoveringMsgInfo._id;

    onDeleteMessageModalClose();
    onDeleteMessage(messageId);
  };

  React.useEffect(() => {
    if (
      scrollState === EScrollStates.INDETERMINED ||
      scrollState === EScrollStates.AT_BOTTOM
    ) {
      setTimeout(() => scrollToBottom(ref), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, messagesQueue]);

  React.useEffect(() => {
    if (!!channelId) {
      setTimeout(() => scrollToBottom(ref), 50);
    }
  }, [channelId]);

  React.useEffect(() => {
    const handleScrollTop = async () => {
      if (ref.current) {
        const lastScrollHeight = ref.current.scrollHeight;
        await onScrollTop();
        // Keep the scrollTop in the same position
        ref.current.scrollTop = ref.current.scrollHeight - lastScrollHeight;
      }
    };

    if (scrollState === EScrollStates.AT_TOP) {
      handleScrollTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollState]);

  React.useEffect(() => {
    if (activeChannel) {
      setHoveringMsgInfo(initialHoveringMsgInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel]);

  return (
    <div className={classes.container} ref={ref}>
      {renderMessages()}
      {renderQueue()}
      <IconButton
        aria-label={trans('Common:Options')}
        aria-controls={`msg-menu-${channelId}`}
        aria-haspopup="true"
        style={{
          position: 'absolute',
          padding: '0',
          top: hoveringMsgInfo.top,
          left: hoveringMsgInfo.left,
          display: !!hoveringMsgInfo._id ? 'block' : 'none',
        }}
        onClick={handleOptionsClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`msg-menu-${channelId}`}
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {hoveringMsgInfo.type === MESSAGE_TYPES.TEXT && (
          <MenuItem onClick={handleEditClick}>{trans('Common:Edit')}</MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick}>
          {trans('Common:Delete')}
        </MenuItem>
      </Menu>
      <AreYouSureModal
        isOpen={isDeleteMessageModalOpen}
        body="Messages:Are you sure you want to delete this message?"
        onConfirm={onDeleteMessageModalConfirm}
        onClose={onDeleteMessageModalClose}
      />
    </div>
  );
};

const getMessageByType = (message: IMessage) => {
  switch (message.type) {
    case MESSAGE_TYPES.TEXT:
      return <TextMessage message={message} />;
    case MESSAGE_TYPES.UPLOADED_FILE: {
      const body = message.body as IAttachment;
      if (body.mimeType.startsWith('image/'))
        return <UploadedImageMessage message={message} />;
      else if (body.mimeType.startsWith('audio/'))
        return <AudioMessage message={message} />;
      else return <UploadedFileMessage message={message} />;
    }
    default:
      return null;
  }
};

const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
  if (ref.current) {
    const scrollHeight = ref.current.scrollHeight;
    const height = ref.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    if (ref.current.scroll) {
      ref.current.scroll({ top: scrollHeight - height, behavior: 'smooth' });
    } else if (ref.current.scrollTo) {
      ref.current.scrollTo({ top: scrollHeight - height, behavior: 'smooth' });
    } else {
      ref.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }
};

const getFirstName = (nickname: string) => {
  const tmp = nickname.split(' ')[0];
  return tmp.charAt(0).toUpperCase() + tmp.slice(1);
};

const getTime = (date: Date) => {
  const hour = date.getHours();
  const min = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${min}`;
};

export type { TProps };
export const UnconnectedMessagesContainer = MessagesContainer;
export default connector(MessagesContainer);

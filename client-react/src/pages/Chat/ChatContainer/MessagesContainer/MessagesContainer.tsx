import React from 'react';
import { useTranslation } from 'react-i18next';

import { CircularProgress, Paper } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

import { MESSAGE_TYPES } from '~/constants/message_types';
import useScrollState, { EScrollStates } from '~/hooks/useScrollState';
import { IAttachment, IMessage, IOtherUsers } from '~/redux/chat/types';
import { IUser } from '~/redux/user/types';

import {
  DateMessage,
  SystemMessage,
  TextMessage,
  UploadedFileMessage,
  UploadedImageMessage,
} from './Messages';
import AudioMessage from './Messages/AudioMessage';
import useStyles from './useStyles';

interface IOwnProps {
  messages: IMessage[];
  messagesQueue: IMessage[];
  loggedUser: IUser;
  users: IOtherUsers;
  onScrollTop: () => Promise<void>;
}

type TProps = IOwnProps;

const MessagesContainer = ({
  messages,
  messagesQueue,
  loggedUser,
  users,
  onScrollTop,
}: TProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const scrollState = useScrollState(ref.current);
  const { t: trans } = useTranslation(['Messages']);
  const classes = useStyles();

  const channelId = messages[0]?.channel_id;

  const renderMessage = (
    message: IMessage,
    shouldShowUserInfo: boolean = false,
    isQueuedMessage: boolean = false,
  ) => {
    const isLoggedUser = message.from_id === loggedUser._id;
    const msgClassName = isLoggedUser
      ? classes.messageFromMe
      : classes.messageFromThem;
    const infoClassName = isLoggedUser ? classes.myInfo : classes.theirInfo;

    const user = users[message.from_id || ''] || loggedUser;
    const nickname = getFirstName(user.nickname);
    const date = getTime(message.createdAt);

    return (
      <React.Fragment key={message._id}>
        {shouldShowUserInfo && (
          <div className={infoClassName}>
            {isLoggedUser ? date : `${nickname}, ${date}`}
          </div>
        )}
        <Paper className={msgClassName}>
          {shouldShowUserInfo && !isLoggedUser && (
            <AccountCircleIcon className={classes.user_icon} />
          )}
          {isQueuedMessage && (
            <CircularProgress
              title={trans('Messages:Sending the message')}
              color="secondary"
              thickness={4}
              className={classes.loading_icon}
            />
          )}
          {getMessageByType(message)}
        </Paper>
      </React.Fragment>
    );
  };

  const renderMessages = () => {
    const ret = [];
    let lastDate: Date | undefined = undefined;
    let lastUserId: string | undefined = undefined;
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

      if (!message.from_id) {
        ret.push(<SystemMessage key={message._id} message={message} />);
      } else {
        const isOtherTime =
          lastDate &&
          (lastDate.getHours() !== message.createdAt.getHours() ||
            Math.abs(lastDate.getMinutes() - message.createdAt.getMinutes()) >=
              5);
        const shouldShowUserInfo =
          lastUserId !== message.from_id || addedDate || isOtherTime;
        ret.push(renderMessage(message, shouldShowUserInfo));
      }

      lastDate = message.createdAt;
      lastUserId = message.from_id;
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
    async function handleScrollTop() {
      if (ref.current) {
        const lastScrollHeight = ref.current.scrollHeight;
        await onScrollTop();
        // Keep the scrollTop in the same position
        ref.current.scrollTop = ref.current.scrollHeight - lastScrollHeight;
      }
    }

    if (scrollState === EScrollStates.AT_TOP) {
      handleScrollTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollState]);

  return (
    <div className={classes.container} ref={ref}>
      {renderMessages()}
      {renderQueue()}
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
export default MessagesContainer;

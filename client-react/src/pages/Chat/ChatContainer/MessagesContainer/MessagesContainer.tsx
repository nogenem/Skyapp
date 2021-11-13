import React from 'react';
import { useTranslation } from 'react-i18next';

import { CircularProgress, Paper } from '@material-ui/core';

import { MESSAGE_TYPES } from '~/constants/message_types';
import { IAttachment, IMessage } from '~/redux/chat/types';
import { IUser } from '~/redux/user/types';

import {
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
}

type TProps = IOwnProps;

const MessagesContainer = ({ messages, messagesQueue, loggedUser }: TProps) => {
  const { t: trans } = useTranslation(['Messages']);
  const ref = React.useRef<HTMLDivElement>(null);
  const classes = useStyles();

  const renderMessage = (
    message: IMessage,
    isQueuedMessage: boolean = false,
  ) => {
    const isLoggedUser = message.from_id === loggedUser._id;
    const msgClassName = isLoggedUser
      ? classes.messageFromMe
      : classes.messageFromThem;

    return (
      <Paper key={message._id} className={msgClassName}>
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
    );
  };

  const renderMessages = () => {
    const ret = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message.from_id) {
        ret.push(<SystemMessage key={message._id} message={message} />);
      } else {
        ret.push(renderMessage(message));
      }
    }
    return ret;
  };

  const renderQueue = () => {
    const ret = [];
    for (let i = 0; i < messagesQueue.length; i++) {
      const message = messagesQueue[i];
      ret.push(renderMessage(message, true));
    }
    return ret;
  };

  React.useEffect(() => {
    if (!!messages && messages.length) {
      setTimeout(() => scrollToBottom(ref), 50);
    }
  }, [messages]);

  React.useEffect(() => {
    if (!!messagesQueue && messagesQueue.length) {
      setTimeout(() => scrollToBottom(ref), 50);
    }
  }, [messagesQueue]);

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

export type { TProps };
export default MessagesContainer;

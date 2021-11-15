import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';
import { AxiosError } from 'axios';

import {
  fetchMessages as fetchMessagesAction,
  sendMessage as sendMessageAction,
  sendFiles as sendFilesAction,
} from '~/redux/chat/actions';
import {
  getActiveChannel,
  getActiveChannelMessages,
  getActiveChannelTotalMessages,
  getMessagesQueue,
} from '~/redux/chat/reducer';
import { IAppState } from '~/redux/store';
import { getUser } from '~/redux/user/reducer';
import handleServerErrors from '~/utils/handleServerErrors';
import { Toast } from '~/utils/Toast';

import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessagesContainer';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  activeChannel: getActiveChannel(state),
  activeChannelMessages: getActiveChannelMessages(state),
  activeChannelTotalMessages: getActiveChannelTotalMessages(state),
  loggedUser: getUser(state),
  messagesQueue: getMessagesQueue(state),
});
const mapDispatchToProps = {
  fetchMessages: fetchMessagesAction,
  sendMessage: sendMessageAction,
  sendFiles: sendFilesAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const ChatContainer = ({
  activeChannel,
  activeChannelMessages,
  activeChannelTotalMessages,
  messagesQueue,
  loggedUser,
  fetchMessages,
  sendMessage,
  sendFiles,
}: TProps) => {
  const classes = useStyles();

  const handleSubmit = (message: string) => {
    try {
      sendMessage(activeChannel?._id as string, message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendingFiles = async (filesData: FormData) => {
    try {
      filesData.append('channel_id', activeChannel?._id as string);
      await sendFiles(filesData);
    } catch (err) {
      const errors = handleServerErrors(err as AxiosError);
      if (errors.global) {
        Toast.error({
          html: errors.global,
        });
      }
    }
  };

  const onScrollTop = async () => {
    if (
      activeChannel !== undefined &&
      activeChannelMessages !== undefined &&
      activeChannelTotalMessages !== undefined
    ) {
      if (activeChannelMessages.length < activeChannelTotalMessages) {
        await fetchMessages({
          channel_id: activeChannel._id,
          offset: activeChannelMessages.length,
        });
      }
    }
  };

  React.useEffect(() => {
    async function fetchData() {
      if (!!activeChannel) {
        await fetchMessages({ channel_id: activeChannel._id, offset: 0 });
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?._id]);

  if (!activeChannel || !activeChannelMessages || !messagesQueue) return null;
  return (
    <div className={classes.content}>
      <MessagesContainer
        messages={activeChannelMessages}
        messagesQueue={messagesQueue}
        loggedUser={loggedUser}
        onScrollTop={onScrollTop}
      />
      <ChatInput
        handleSubmit={handleSubmit}
        handleSendingFiles={handleSendingFiles}
      />
    </div>
  );
};

export type { TProps };
export const UnconnectedChatContainer = ChatContainer;
export default connector(ChatContainer);

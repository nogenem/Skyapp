import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';
import { AxiosError } from 'axios';

import useMediaQuery from '~/hooks/useMediaQuery';
import {
  fetchMessages as fetchMessagesAction,
  sendMessage as sendMessageAction,
  sendFiles as sendFilesAction,
  setActiveChannel as setActiveChannelAction,
} from '~/redux/chat/actions';
import { getActiveChannel, getActiveChannelInfo } from '~/redux/chat/reducer';
import { IAppState } from '~/redux/store';
import { getUser } from '~/redux/user/reducer';
import handleServerErrors from '~/utils/handleServerErrors';
import { Toast } from '~/utils/Toast';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessagesContainer';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  activeChannel: getActiveChannel(state),
  activeChannelInfo: getActiveChannelInfo(state),
  loggedUser: getUser(state),
});
const mapDispatchToProps = {
  fetchMessages: fetchMessagesAction,
  sendMessage: sendMessageAction,
  sendFiles: sendFilesAction,
  setActiveChannel: setActiveChannelAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const ChatContainer = ({
  activeChannel,
  activeChannelInfo,
  loggedUser,
  fetchMessages,
  sendMessage,
  sendFiles,
  setActiveChannel,
}: TProps) => {
  const isSmall = useMediaQuery('(max-width: 875px)');
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
      activeChannelInfo !== undefined &&
      activeChannelInfo.messages.length < activeChannelInfo.totalMessages
    ) {
      await fetchMessages({
        channel_id: activeChannelInfo._id,
        offset: activeChannelInfo.messages.length,
      });
    }
  };

  const onHeaderGoBack = () => {
    setActiveChannel(undefined);
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

  if (!activeChannel || !activeChannelInfo) return null;
  return (
    <div className={classes.content}>
      <ChatHeader
        activeChannel={activeChannel}
        showGoBackButton={isSmall}
        onGoBack={onHeaderGoBack}
      />
      <MessagesContainer
        messages={activeChannelInfo.messages}
        messagesQueue={activeChannelInfo.queue}
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

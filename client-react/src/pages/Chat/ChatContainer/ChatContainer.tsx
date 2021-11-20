import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';
import { AxiosError } from 'axios';

import {
  fetchMessages as fetchMessagesAction,
  sendMessage as sendMessageAction,
  sendFiles as sendFilesAction,
  sendSetActiveChannel as sendSetActiveChannelAction,
} from '~/redux/chat/actions';
import { getActiveChannelInfo, getUsers } from '~/redux/chat/reducer';
import { IChannel } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import { getUser } from '~/redux/user/reducer';
import handleServerErrors from '~/utils/handleServerErrors';
import { Toast } from '~/utils/Toast';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessagesContainer';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  activeChannelInfo: getActiveChannelInfo(state),
  loggedUser: getUser(state),
  users: getUsers(state),
});
const mapDispatchToProps = {
  fetchMessages: fetchMessagesAction,
  sendMessage: sendMessageAction,
  sendFiles: sendFilesAction,
  sendSetActiveChannel: sendSetActiveChannelAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  activeChannel: IChannel | undefined;
  isSmall: boolean;
}

type TProps = OwnProps & TPropsFromRedux & RouteComponentProps;

const ChatContainer = ({
  activeChannel,
  isSmall,
  activeChannelInfo,
  loggedUser,
  users,
  fetchMessages,
  sendMessage,
  sendFiles,
  sendSetActiveChannel,
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
    sendSetActiveChannel(undefined);
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
        users={users}
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

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

import { MESSAGE_TYPES } from '~/constants/message_types';
import useVisibility from '~/hooks/useVisibility';
import {
  fetchMessages as fetchMessagesAction,
  sendMessage as sendMessageAction,
  sendFiles as sendFilesAction,
  sendSetActiveChannel as sendSetActiveChannelAction,
  sendSetLastSeen as sendSetLastSeenAction,
  sendEditMessage as sendEditMessageAction,
} from '~/redux/chat/actions';
import { getActiveChannelInfo, getUsers } from '~/redux/chat/reducer';
import { IChannel, IMessage } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import { getUser } from '~/redux/user/reducer';

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
  sendSetLastSeen: sendSetLastSeenAction,
  sendEditMessage: sendEditMessageAction,
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
  sendSetLastSeen,
  sendEditMessage,
}: TProps) => {
  const [editingMessage, setEditingMessage] = React.useState<IMessage>();
  const classes = useStyles();

  const handleSubmit = (message: string) => {
    try {
      if (editingMessage) {
        sendEditMessage(editingMessage, message);
        setEditingMessage(undefined);
      } else {
        sendMessage(activeChannel?._id as string, message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendingFiles = (filesData: FormData) => {
    try {
      filesData.append('channel_id', activeChannel?._id as string);
      sendFiles(filesData);
    } catch (err) {
      console.error(err);
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

  const changeEditingMessage = (messageId: string) => {
    const message = activeChannelInfo?.messages.find(
      message => message._id === messageId,
    );
    setEditingMessage(message);
  };

  const startEditingLoggedUserLastestMessage = () => {
    if (activeChannelInfo) {
      let message: IMessage | undefined = undefined;
      for (let i = activeChannelInfo.messages.length - 1; i >= 0; i--) {
        const tmpMsg = activeChannelInfo.messages[i];
        if (
          tmpMsg.from_id === loggedUser._id &&
          tmpMsg.type === MESSAGE_TYPES.TEXT
        ) {
          message = tmpMsg;
          break;
        }
      }

      if (message) {
        setEditingMessage(message);
      }
    }
  };

  const stopEditingMessage = () => {
    setEditingMessage(undefined);
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

  useOnLastMessageChangeDebounced(
    (channelId: string) => {
      sendSetLastSeen(channelId);
    },
    5 * 1000,
    activeChannel,
  );

  if (!activeChannel || !activeChannelInfo) return null;
  return (
    <div className={classes.content}>
      <ChatHeader
        activeChannel={activeChannel}
        showGoBackButton={isSmall}
        onGoBack={onHeaderGoBack}
      />
      <MessagesContainer
        activeChannel={activeChannel}
        messages={activeChannelInfo.messages}
        messagesQueue={activeChannelInfo.queue}
        loggedUser={loggedUser}
        users={users}
        onScrollTop={onScrollTop}
        changeEditingMessage={changeEditingMessage}
      />
      <ChatInput
        channelId={activeChannel._id}
        editingMessage={editingMessage}
        handleSubmit={handleSubmit}
        handleSendingFiles={handleSendingFiles}
        startEditingLoggedUserLastestMessage={
          startEditingLoggedUserLastestMessage
        }
        stopEditingMessage={stopEditingMessage}
      />
    </div>
  );
};

const useOnLastMessageChangeDebounced = (
  callback: (channelId: string) => void,
  delay: number,
  activeChannel: IChannel | undefined,
) => {
  const isVisible = useVisibility();
  const lastChannelIdRef = React.useRef<string>();
  const callbacksPendingRef = React.useRef<Record<string, boolean>>({});
  const timeoutsRef = React.useRef<Record<string, NodeJS.Timeout>>({});

  const clearAll = React.useCallback(() => {
    Object.keys(timeoutsRef.current).forEach(id => {
      clearTimeout(timeoutsRef.current[id]);
    });
  }, []);

  const updateTimeout = (channelId: string) => {
    if (timeoutsRef.current[channelId])
      clearTimeout(timeoutsRef.current[channelId]);

    timeoutsRef.current[channelId] = setTimeout(
      () => callback(channelId),
      delay,
    );
  };

  React.useEffect(() => {
    const lastChannelId = lastChannelIdRef.current;
    lastChannelIdRef.current = activeChannel?._id;

    if (
      !activeChannel ||
      activeChannel._id !== lastChannelId ||
      activeChannel.is_group
    )
      return;

    const channelId = activeChannel._id;

    if (!isVisible) {
      callbacksPendingRef.current[channelId] = true;
      return;
    }

    updateTimeout(channelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?._id, activeChannel?.lastMessage]);

  React.useEffect(() => {
    if (isVisible) {
      Object.keys(callbacksPendingRef.current).forEach(channelId => {
        if (callbacksPendingRef.current[channelId]) {
          callbacksPendingRef.current[channelId] = false;

          if (channelId === activeChannel?._id) {
            updateTimeout(channelId);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  React.useEffect(() => {
    return clearAll;
  }, [clearAll]);
};

export type { TProps };
export const UnconnectedChatContainer = ChatContainer;
export default connector(ChatContainer);

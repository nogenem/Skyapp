import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

import { fetchMessages as fetchMessagesAction } from '~/redux/chat/actions';
import {
  getActiveChannel,
  getActiveChannelMessages,
} from '~/redux/chat/reducer';
import { IAppState } from '~/redux/store';

import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessagesContainer';

const mapStateToProps = (state: IAppState) => ({
  activeChannel: getActiveChannel(state),
  activeChannelMessages: getActiveChannelMessages(state),
});
const mapDispatchToProps = {
  fetchMessages: fetchMessagesAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const ChatContainer = ({
  activeChannel,
  activeChannelMessages,
  fetchMessages,
}: TProps) => {
  React.useEffect(() => {
    async function fetchData() {
      if (!!activeChannel) {
        await fetchMessages({ channel_id: activeChannel._id, offset: 0 });
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?._id]);

  if (!activeChannel || !activeChannelMessages) return null;
  return (
    <>
      <MessagesContainer messages={activeChannelMessages} />
      <ChatInput />
    </>
  );
};

export type { TProps };
export const UnconnectedChatContainer = ChatContainer;
export default connector(ChatContainer);

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

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
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const ChatContainer = ({ activeChannel, activeChannelMessages }: TProps) => {
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

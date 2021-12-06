import React from 'react';

import { IMessage } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { MessagesContainer } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('MessagesContainer', () => {
  it('renders correctly', () => {
    const messages: IMessage[] = [
      FACTORIES.models.message(
        {
          _id: 'message-1',
          body: 'message 1',
        },
        { useConstValues: true },
      ),
    ];
    const messagesQueue: IMessage[] = [
      FACTORIES.models.message(
        {
          _id: 'queue-message-1',
          body: 'queued message',
        },
        { useConstValues: true },
      ),
    ];
    const loggedUser = FACTORIES.models.user({}, { useConstValues: true });

    const { container, getByText } = renderWithRedux(
      <MessagesContainer
        messages={messages}
        messagesQueue={messagesQueue}
        loggedUser={loggedUser}
        users={{}}
        onScrollTop={async () => {}}
        changeEditingMessage={(messageId: string) => {}}
        onDeleteMessage={(messageId: string) => {}}
      />,
    );

    expect(container).toMatchSnapshot();
    expect(getByText(messages[0].body as string)).toBeInTheDocument();
    expect(getByText(messagesQueue[0].body as string)).toBeInTheDocument();
  });
});

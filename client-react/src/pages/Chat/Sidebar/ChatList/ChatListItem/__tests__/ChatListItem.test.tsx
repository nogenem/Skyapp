import React from 'react';

import { fireEvent } from '@testing-library/dom';
import { render } from '@testing-library/react';

import { IChannel } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { ChatListItem, UnconnectedChatListItem } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected ChatListItem', () => {
  it('renders correctly when channel is not a group', () => {
    const channel: IChannel = FACTORIES.models.channel(
      {},
      { useConstValues: true, membersLen: 2 },
    );
    const initialState = {
      chat: FACTORIES.states.chat({
        channels: { [channel._id]: channel },
      }),
    };

    const { container } = renderWithRedux(
      <ChatListItem channelId={channel._id} selected={false} />,
      initialState,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders correctly when channel is a group', () => {
    const channel: IChannel = FACTORIES.models.channel(
      {},
      { useConstValues: true, membersLen: 3 },
    );
    const initialState = {
      chat: FACTORIES.states.chat({
        channels: { [channel._id]: channel },
      }),
    };

    const { container } = renderWithRedux(
      <ChatListItem channelId={channel._id} selected={false} />,
      initialState,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ChatListItem', () => {
  it('calls `emitSetActiveChannel` when clicking on item', () => {
    const channel: IChannel = FACTORIES.models.channel(
      {},
      { useConstValues: true },
    );
    const otherUser = FACTORIES.models.otherUser({}, { useConstValues: true });
    const emitSetActiveChannel = jest.fn();
    const sendLeaveGroupChannel = jest.fn();

    const { getByText } = render(
      <UnconnectedChatListItem
        channelId={channel._id}
        selected={false}
        otherUser={otherUser}
        channel={channel}
        emitSetActiveChannel={emitSetActiveChannel}
        sendLeaveGroupChannel={sendLeaveGroupChannel}
      />,
    );

    fireEvent.click(getByText(channel.name));

    expect(emitSetActiveChannel).toHaveBeenCalled();
    expect(emitSetActiveChannel).toHaveBeenCalledWith(channel._id);
  });
});

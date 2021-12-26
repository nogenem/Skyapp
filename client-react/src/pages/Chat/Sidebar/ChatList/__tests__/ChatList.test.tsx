import React from 'react';

import type { IChannel } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { ChatList } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected ChatList', () => {
  it('renders correctly', () => {
    const initialState = {
      chat: FACTORIES.states.chat({}, { useConstValues: true }),
    };

    const { container } = renderWithRedux(
      <ChatList filter="" activeChannelId={undefined} />,
      initialState,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders correctly when `filter` is not empty', () => {
    const channel1: IChannel = FACTORIES.models.channel(
      {
        _id: 'channel-1',
        name: 'Channel 1',
      },
      { useConstValues: true },
    );
    const channel2: IChannel = FACTORIES.models.channel(
      {
        _id: 'channel-2',
        name: 'Channel 2',
      },
      { useConstValues: true },
    );
    const initialState = {
      chat: FACTORIES.states.chat({
        channels: {
          [channel1._id]: channel1,
          [channel2._id]: channel2,
        },
      }),
    };

    const { queryByText } = renderWithRedux(
      <ChatList filter={channel1.name} activeChannelId={undefined} />,
      initialState,
    );

    const channel1NameRegExp = new RegExp(channel1.name, 'i');
    const channel2NameRegExp = new RegExp(channel2.name, 'i');
    expect(queryByText(channel1NameRegExp)).toBeInTheDocument();
    expect(queryByText(channel2NameRegExp)).not.toBeInTheDocument();
  });
});

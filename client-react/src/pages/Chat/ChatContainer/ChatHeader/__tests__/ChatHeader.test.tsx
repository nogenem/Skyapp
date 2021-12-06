import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import { IChannel, IOtherUser, IOtherUsers } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { ChatHeader, UnconnectedChatHeader } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected ChatHeader', () => {
  it('renders correctly when channel is not a group', () => {
    const users: IOtherUsers = {};
    for (let i = 0; i < 2; i++) {
      const otherUser = FACTORIES.models.otherUser(
        { _id: `other-user-${i}` },
        { useConstValues: true },
      );
      users[otherUser._id] = otherUser;
    }

    const channel: IChannel = FACTORIES.models.channel(
      {
        members: Object.keys(users).map(userId =>
          FACTORIES.models.member(
            { user_id: userId },
            { useConstValues: true },
          ),
        ),
      },
      { useConstValues: true },
    );

    const initialState = {
      chat: FACTORIES.states.chat({
        users,
        channels: { [channel._id]: channel },
        activeChannelInfo: FACTORIES.models.activeChannelInfo(
          {
            _id: channel._id,
          },
          { useConstValues: true },
        ),
      }),
    };

    const { container } = renderWithRedux(
      <ChatHeader showGoBackButton={false} onGoBack={() => {}} />,
      initialState,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders correctly when channel is a group', () => {
    const users: IOtherUsers = {};
    for (let i = 0; i < 3; i++) {
      const otherUser = FACTORIES.models.otherUser(
        { _id: `other-user-${i}` },
        { useConstValues: true },
      );
      users[otherUser._id] = otherUser;
    }

    const channel: IChannel = FACTORIES.models.channel(
      {
        is_group: true,
        members: Object.keys(users).map(userId =>
          FACTORIES.models.member(
            { user_id: userId },
            { useConstValues: true },
          ),
        ),
      },
      { useConstValues: true },
    );

    const initialState = {
      chat: FACTORIES.states.chat({
        users,
        channels: { [channel._id]: channel },
        activeChannelInfo: FACTORIES.models.activeChannelInfo(
          {
            _id: channel._id,
          },
          { useConstValues: true },
        ),
      }),
    };

    const { container } = renderWithRedux(
      <ChatHeader showGoBackButton={false} onGoBack={() => {}} />,
      initialState,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ChatHeader', () => {
  it('renders the `go back` button and handles clicking on it', () => {
    const otherUsers: IOtherUser[] = [
      FACTORIES.models.otherUser({}, { useConstValues: true }),
    ];
    const onGoBack = jest.fn();
    const { getByLabelText } = render(
      <UnconnectedChatHeader
        showGoBackButton
        onGoBack={onGoBack}
        otherUsers={otherUsers}
        activeChannelIsGroup={false}
      />,
    );

    expect(getByLabelText(/go back/i)).toBeInTheDocument();

    fireEvent.click(getByLabelText(/go back/i));

    expect(onGoBack).toHaveBeenCalled();
  });
});

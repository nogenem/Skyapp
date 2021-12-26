import React from 'react';

import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import type { IOtherUser } from '~/redux/chat/types';
import type { IAppState } from '~/redux/store';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  NewChatModal as ConnectedNewChatModal,
  UnconnectedNewChatModal,
} from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected NewChatModal', () => {
  it('renders correctly', () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser(
      { channelId: undefined },
      { useConstValues: true },
    );
    const initialState: Partial<IAppState> = {
      chat: FACTORIES.states.chat({
        users: { [otherUser._id]: otherUser },
      }),
    };

    const { getByRole } = renderWithRedux(
      <ConnectedNewChatModal isOpen onClose={() => {}} />,
      initialState,
    );

    expect(getByRole('presentation')).toMatchSnapshot();
  });
});

describe('Unconnected NewChatModal', () => {
  it('handles start chatting with other people', async () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser();
    const users = [otherUser];
    const onClose = jest.fn(() => {});
    const sendCreateChannelWith = jest.fn(() => Promise.resolve());

    const { getByText } = renderWithRedux(
      <UnconnectedNewChatModal
        isOpen
        onClose={onClose}
        users={users}
        sendCreateChannelWith={sendCreateChannelWith}
      />,
    );

    expect(getByText(otherUser.nickname)).toBeInTheDocument();

    fireEvent.click(getByText(otherUser.nickname));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(sendCreateChannelWith).toHaveBeenCalledWith(otherUser);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles filtering the users', async () => {
    const otherUser1: IOtherUser = FACTORIES.models.otherUser({
      nickname: 'User 1',
    });
    const otherUser2: IOtherUser = FACTORIES.models.otherUser({
      nickname: 'User 2',
    });
    const users = [otherUser1, otherUser2];
    const onClose = jest.fn(() => {});
    const sendCreateChannelWith = jest.fn(() => Promise.resolve());

    const { getByText, baseElement, queryByText } = renderWithRedux(
      <UnconnectedNewChatModal
        isOpen
        onClose={onClose}
        users={users}
        sendCreateChannelWith={sendCreateChannelWith}
      />,
    );

    expect(getByText(otherUser1.nickname)).toBeInTheDocument();
    expect(getByText(otherUser2.nickname)).toBeInTheDocument();

    // leave only user 1
    fireEvent.change(
      baseElement.querySelector('input[name="search"]') as Element,
      {
        target: { value: otherUser1.nickname },
      },
    );

    await waitForElementToBeRemoved(getByText(otherUser2.nickname));

    expect(getByText(otherUser1.nickname)).toBeInTheDocument();
    expect(queryByText(otherUser2.nickname)).not.toBeInTheDocument();

    // remove both users
    fireEvent.change(
      baseElement.querySelector('input[name="search"]') as Element,
      {
        target: { value: 'hello' },
      },
    );

    await waitForElementToBeRemoved(getByText(otherUser1.nickname));

    expect(queryByText(otherUser1.nickname)).not.toBeInTheDocument();
    expect(queryByText(otherUser2.nickname)).not.toBeInTheDocument();
    expect(getByText(/no user found/i)).toBeInTheDocument();
  });

  it('renders a message when no user is passed to it', async () => {
    const users: IOtherUser[] = [];
    const onClose = jest.fn(() => {});
    const sendCreateChannelWith = jest.fn(() => Promise.resolve());

    const { getByText } = renderWithRedux(
      <UnconnectedNewChatModal
        isOpen
        onClose={onClose}
        users={users}
        sendCreateChannelWith={sendCreateChannelWith}
      />,
    );

    expect(
      getByText(/you are already chatting with everyone!/i),
    ).toBeInTheDocument();
  });
});

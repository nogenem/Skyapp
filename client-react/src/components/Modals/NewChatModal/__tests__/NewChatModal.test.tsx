import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react';

import { USER_STATUS } from '~/constants/user_status';
import { IOtherUser } from '~/redux/chat/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  NewChatModal as ConnectedNewChatModal,
  UnconnectedNewChatModal,
} from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected NewChatModal', () => {
  it('renders correctly', () => {
    const otherUser: IOtherUser = {
      _id: '123456',
      nickname: 'Test',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };
    const { getByRole } = renderWithRedux(
      <ConnectedNewChatModal isOpen onClose={() => {}} />,
      {
        chat: {
          users: {
            [otherUser._id]: otherUser,
          },
          channels: {},
        },
      },
    );

    expect(getByRole('presentation')).toMatchSnapshot();
  });
});

describe('Unconnected NewChatModal', () => {
  it('handles start chatting with other people', async () => {
    const otherUser: IOtherUser = {
      _id: '123456',
      nickname: 'Test',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };
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

    expect(sendCreateChannelWith).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react';

import { USER_STATUS } from '~/constants/user_status';
import { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  NewChatModal as ConnectedNewChatModal,
  UnconnectedNewChatModal,
} from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected NewChatModal', () => {
  it('renders correctly', () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser({
      nickname: 'Test',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
      channel_id: undefined,
    });
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
  });
});

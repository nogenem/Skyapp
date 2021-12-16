import React from 'react';

import { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { NewGroupModal as ConnectedNewGroupModal } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected NewGroupModal', () => {
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
      <ConnectedNewGroupModal isOpen onClose={() => {}} />,
      initialState,
    );

    expect(getByRole('presentation')).toMatchSnapshot();
  });
});

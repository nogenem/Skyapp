import React from 'react';

import { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { GroupInfoModal as ConnectedGroupInfoModal } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected GroupInfoModal', () => {
  it('renders correctly', () => {
    const channel = FACTORIES.models.channel({}, { useConstValues: true });
    const otherUser: IOtherUser = FACTORIES.models.otherUser(
      { channel_id: channel._id },
      { useConstValues: true },
    );
    const initialState: Partial<IAppState> = {
      chat: FACTORIES.states.chat({
        channels: { [channel._id]: channel },
        users: { [otherUser._id]: otherUser },
      }),
    };

    const { getByRole } = renderWithRedux(
      <ConnectedGroupInfoModal isOpen channel={channel} onClose={() => {}} />,
      initialState,
    );

    expect(getByRole('presentation')).toMatchSnapshot();
  });
});

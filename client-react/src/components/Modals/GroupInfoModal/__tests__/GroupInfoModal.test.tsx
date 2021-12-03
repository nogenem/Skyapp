import React from 'react';

import { USER_STATUS } from '~/constants/user_status';
import { IOtherUser } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { GroupInfoModal as ConnectedGroupInfoModal } from '../index';

const renderWithRedux = getRenderWithRedux();

describe('Connected GroupInfoModal', () => {
  it('renders correctly', () => {
    const channel = FACTORIES.models.channel({
      name: 'Channel 1',
    });

    const otherUser: IOtherUser = FACTORIES.models.otherUser({
      _id: '1',
      nickname: 'Test',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
      channel_id: channel._id,
    });
    const initialState: Partial<IAppState> = {
      chat: FACTORIES.states.chat({
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

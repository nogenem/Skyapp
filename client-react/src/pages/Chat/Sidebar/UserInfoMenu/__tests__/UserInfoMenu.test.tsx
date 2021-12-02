import React from 'react';

import { USER_STATUS } from '~/constants/user_status';
import type { TUserState } from '~/redux/user/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// ./Menus is already testing the interactions
describe('Connected UserInfoMenu', () => {
  it('renders correctly', () => {
    const initialUser: TUserState = FACTORIES.states.user({
      nickname: 'Test User',
      thoughts: 'Some thoughts...',
      status: USER_STATUS.ACTIVE,
    });
    const initialState = { user: initialUser };

    const { container, getByText } = renderWithRedux(
      <UserInfoMenu />,
      initialState,
    );

    expect(container).toMatchSnapshot();
    expect(getByText(initialUser.nickname)).toBeInTheDocument();
    expect(getByText(initialUser.thoughts)).toBeInTheDocument();
  });
});

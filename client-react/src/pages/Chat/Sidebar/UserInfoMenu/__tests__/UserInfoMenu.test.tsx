import React from 'react';

import type { TUserState } from '~/redux/user/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// ./Menus is already testing the interactions
describe('Connected UserInfoMenu', () => {
  it('renders correctly', () => {
    const initialUser: TUserState = FACTORIES.states.user(
      {},
      { useConstValues: true },
    );
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

import React from 'react';

import type { IUser } from '~/redux/user/types';
import { FACTORIES, getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// ./Menus is already testing the interactions
describe('Connected UserInfoMenu', () => {
  it('renders correctly', () => {
    const initialUser: IUser = FACTORIES.userState();
    const initialState = { user: initialUser };

    const { container, getByText } = renderWithRedux(
      <UserInfoMenu />,
      initialState,
    );

    expect(container).toMatchSnapshot();
    expect(getByText(initialUser.nickname)).toBeInTheDocument();
  });
});

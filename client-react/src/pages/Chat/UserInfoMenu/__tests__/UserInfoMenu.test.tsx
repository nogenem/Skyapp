import React from 'react';

import type { IUser } from '~/redux/user/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// ./Menus is already testing the interactions
describe('Connected UserInfoMenu', () => {
  it('renders correctly', () => {
    const user: IUser = {
      _id: '1',
      nickname: 'Test User',
      email: 'test@test.com',
      confirmed: false,
      token: '123456789',
    };

    const { container, getByText } = renderWithRedux(<UserInfoMenu />, {
      user,
    });

    expect(container).toMatchSnapshot();
    expect(getByText(user.nickname)).toBeInTheDocument();
  });
});

import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import type { IUser } from '~/redux/user/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu, UnconnectedUserInfoMenu } from '../index';

const renderWithRedux = getRenderWithRedux();

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

describe('Unconnected UserInfoMenu', () => {
  it('calls `userSignedOut` when clicking on `Sign Out` menu item', () => {
    const NICKNAME = 'Test User';
    const userSignedOut = jest.fn();

    const { getByText } = render(
      <UnconnectedUserInfoMenu
        userNickname={NICKNAME}
        userSignedOut={userSignedOut}
      />,
    );

    fireEvent.click(getByText(NICKNAME));
    fireEvent.click(getByText(/sign out/i));

    expect(userSignedOut).toHaveBeenCalledTimes(1);
  });
});

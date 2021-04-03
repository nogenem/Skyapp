import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import type { IUser } from '~/redux/user/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import { UserInfoMenu, UnconnectedUserInfoMenu } from '../index';
import type { TProps } from '../index';

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
    const props: TProps = {
      userNickname: 'Test User',
      themeMode: 'dark',
      userSignedOut: jest.fn(),
      switchMode: jest.fn(),
    };

    const { getByText } = render(<UnconnectedUserInfoMenu {...props} />);

    fireEvent.click(getByText(props.userNickname));
    fireEvent.click(getByText(/sign out/i));

    expect(props.userSignedOut).toHaveBeenCalledTimes(1);
  });

  it('calls `switchMode` when clicking on `Theme Toggler` component', () => {
    const props: TProps = {
      userNickname: 'Test User',
      themeMode: 'dark',
      userSignedOut: jest.fn(),
      switchMode: jest.fn(),
    };

    const { getByText, getByTestId } = render(
      <UnconnectedUserInfoMenu {...props} />,
    );

    fireEvent.click(getByText(props.userNickname));
    fireEvent.click(
      // @ts-ignore
      getByTestId(/theme_toggler/i).querySelector('input[type="checkbox"]'),
    );

    expect(props.switchMode).toHaveBeenCalledTimes(1);
    expect(props.switchMode).toHaveBeenCalledWith('light');
  });
});

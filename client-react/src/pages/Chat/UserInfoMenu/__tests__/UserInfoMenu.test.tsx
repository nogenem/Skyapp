import React from 'react';
import { Provider } from 'react-redux';

import { fireEvent, render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';
import type { IUser } from '~/redux/user/types';

import { UserInfoMenu, UnconnectedUserInfoMenu } from '../index';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const emptyState: Partial<IAppState> = {};
const renderWithRedux = (
  ui: React.ReactNode,
  initialState: Partial<IAppState> = emptyState,
) => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
  };
};

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

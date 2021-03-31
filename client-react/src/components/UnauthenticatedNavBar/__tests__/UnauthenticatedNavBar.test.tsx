import React from 'react';
import { Provider } from 'react-redux';

import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';
import { TThemeMode } from '~/redux/theme/types';

import {
  UnauthenticatedNavBar,
  UnconnectedUnauthenticatedNavBar,
} from '../index';

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

describe('UnauthenticatedNavBar', () => {
  it('renders correctly when `isAuthenticated` is false', () => {
    const { getByText } = renderWithRedux(<UnauthenticatedNavBar />);
    expect(getByText(/skyapp/i)).toBeInTheDocument();
  });

  it('renders nothing when `isAuthenticated` is true', () => {
    const initialUser = {
      _id: '',
      nickname: '',
      email: '',
      confirmed: false,
      token: '123456789',
    };
    const initialState = { user: initialUser };

    const { queryByText } = renderWithRedux(
      <UnauthenticatedNavBar />,
      initialState,
    );
    expect(queryByText(/skyapp/i)).not.toBeInTheDocument();
  });

  it('can switch themes', () => {
    const props = {
      isAuthenticated: false,
      theme: 'light' as TThemeMode,
      switchMode: jest.fn(),
    };
    const { getByTestId } = render(
      <UnconnectedUnauthenticatedNavBar {...props} />,
    );

    fireEvent.click(getByTestId('toggle_theme_btn'));

    expect(props.switchMode).toHaveBeenCalledTimes(1);
    expect(props.switchMode).toHaveBeenCalledWith('dark');
  });
});

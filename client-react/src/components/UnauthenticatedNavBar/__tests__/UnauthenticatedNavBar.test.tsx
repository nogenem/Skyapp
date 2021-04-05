import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import { TThemeMode } from '~/redux/theme/types';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  UnauthenticatedNavBar,
  UnconnectedUnauthenticatedNavBar,
} from '../index';
import type { TProps } from '../index';

const renderWithRedux = getRenderWithRedux();

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
    const props: TProps = {
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

  // TODO: Add test !? I dunno how to do it ;/
  // it('can change language', () => {});
});

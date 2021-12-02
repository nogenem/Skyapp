import React from 'react';

import { RouteComponentProps } from '@reach/router';

import { TUserState } from '~/redux/user/types';
import FACTORIES from '~/utils/factories';
import { getRenderWithRedux } from '~/utils/testUtils';

import { Router } from '../index';

const renderWithRedux = getRenderWithRedux();

type TProps = RouteComponentProps;
const HelloWorld = (props: TProps) => <span>Hello World</span>;

const initialUser: TUserState = FACTORIES.states.user();

describe('Router', () => {
  it('renders `children` when `isPrivate` is false and `isAuthenticated` is false', () => {
    const { getByText } = renderWithRedux(
      <Router>
        <HelloWorld default />
      </Router>,
    );

    expect(getByText(/hello world/i)).toBeInTheDocument();
  });

  it('renders `children` when `isPrivate` is true and `isAuthenticated` is true', () => {
    const initialState = { user: initialUser };

    const { getByText } = renderWithRedux(
      <Router isPrivate>
        <HelloWorld default />
      </Router>,
      initialState,
    );

    expect(getByText(/hello world/i)).toBeInTheDocument();
  });

  it("doesn't render `children` when `isPrivate` is false and `isAuthenticated` is true", () => {
    const initialState = { user: initialUser };

    const { queryByText } = renderWithRedux(
      <Router>
        <HelloWorld default />
      </Router>,
      initialState,
    );

    expect(queryByText(/hello world/i)).toBeNull();
  });

  it("doesn't render `children` when `isPrivate` is true and `isAuthenticated` is false", () => {
    const { queryByText } = renderWithRedux(
      <Router isPrivate>
        <HelloWorld default />
      </Router>,
    );

    expect(queryByText(/hello world/i)).toBeNull();
  });
});

import React from 'react';
import { Provider } from 'react-redux';

import { RouteComponentProps } from '@reach/router';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';

import { Router } from '../index';

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

type TProps = RouteComponentProps;
const HelloWorld = (props: TProps) => <span>Hello World</span>;

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
    const initialState = { user: { _id: '', token: '123456789' } };

    const { getByText } = renderWithRedux(
      <Router isPrivate>
        <HelloWorld default />
      </Router>,
      initialState,
    );

    expect(getByText(/hello world/i)).toBeInTheDocument();
  });

  it("doesn't render `children` when `isPrivate` is false and `isAuthenticated` is true", () => {
    const initialState = { user: { _id: '', token: '123456789' } };

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

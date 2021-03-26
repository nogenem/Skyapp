import React from 'react';
import { Provider } from 'react-redux';

import * as router from '@reach/router';
import { render, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import type { IAppState } from '~/redux/store';

import {
  Redirect as RedirectPage,
  UnconnectedRedirect as UnconnectedRedirectPage,
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

// TODO: Add better tests for this !?
describe('Connected RedirectPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', async () => {
    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;

    const spy = jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const { container } = renderWithRedux(
      <RedirectPage default navigate={router.navigate} />,
    );

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1), {
      container: container as HTMLElement,
    });

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected RedirectPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Redirects to `/signin` if `isAuthenticated` is false', async () => {
    const isAuthenticated = false;
    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;

    const spy = jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const { container } = render(
      <UnconnectedRedirectPage
        isAuthenticated={isAuthenticated}
        default
        navigate={router.navigate}
      />,
    );

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1), {
      container: container as HTMLElement,
    });

    expect(spy.mock.calls[0][0]).toBe('/signin');
  });

  it('Redirects to `/chat` if `isAuthenticated` is true', async () => {
    const isAuthenticated = true;
    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;

    const spy = jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const { container } = render(
      <UnconnectedRedirectPage
        isAuthenticated={isAuthenticated}
        default
        navigate={router.navigate}
      />,
    );

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1), {
      container: container as HTMLElement,
    });

    expect(spy.mock.calls[0][0]).toBe('/chat');
  });
});

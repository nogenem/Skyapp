import React from 'react';
import { Provider } from 'react-redux';

import { render, waitForElementToBeRemoved } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import type { IAppState } from '~/redux/store';
import { ITokenCredentials } from '~/redux/user/types';

import { App, UnconnectedApp } from '../index';

jest.mock('../../redux/user/actions', () => ({
  validateToken: () => () => Promise.resolve(),
}));

const VALID_TOKEN = '123456789';

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

describe('Connected App', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', async () => {
    const { container, queryByTestId } = renderWithRedux(<App />);

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected App', () => {
  it('Trys to confirm token', async () => {
    const credentials: ITokenCredentials = { token: VALID_TOKEN };
    const validateToken = jest.fn(() => Promise.resolve());

    localStorage.setItem(LOCAL_STORAGE_TOKEN, VALID_TOKEN);
    const { container, queryByTestId } = renderWithRedux(
      <UnconnectedApp validateToken={validateToken} />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(validateToken).toHaveBeenCalledTimes(1);
    expect(validateToken).toHaveBeenCalledWith(credentials);
  });
});

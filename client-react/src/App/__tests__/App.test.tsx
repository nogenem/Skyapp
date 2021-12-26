import React from 'react';

import { waitForElementToBeRemoved } from '@testing-library/react';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import type { IValidateTokenRequestBody } from '~/requestsParts/auth';
import { getRenderWithRedux } from '~/utils/testUtils';

import { App, UnconnectedApp } from '../index';

jest.mock('../../redux/user/actions', () => ({
  sendValidateToken: () => () => Promise.resolve(),
}));

const VALID_TOKEN = '123456789';

const renderWithRedux = getRenderWithRedux();

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
    const data: IValidateTokenRequestBody = { token: VALID_TOKEN };
    const sendValidateToken = jest.fn(() => Promise.resolve());

    localStorage.setItem(LOCAL_STORAGE_TOKEN, VALID_TOKEN);
    const { container, queryByTestId } = renderWithRedux(
      <UnconnectedApp sendValidateToken={sendValidateToken} />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(sendValidateToken).toHaveBeenCalledTimes(1);
    expect(sendValidateToken).toHaveBeenCalledWith(data);
  });
});

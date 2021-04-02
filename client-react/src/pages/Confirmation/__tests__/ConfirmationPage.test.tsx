import React from 'react';

import * as router from '@reach/router';
import {
  render,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';

import { ITokenCredentials } from '~/redux/user/types';
import type {
  IServerErrorsObject,
  IPartialAxiosError,
} from '~/utils/handleServerErrors';
import { getRenderWithRedux } from '~/utils/testUtils';

import {
  Confirmation as ConfirmationPage,
  UnconnectedConfirmation as UnconnectedConfirmationPage,
} from '../index';

jest.mock('../../../redux/user/actions', () => ({
  confirmation: () => () => Promise.resolve(),
}));

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';

const mockServerResponse = (
  errors: IServerErrorsObject,
): IPartialAxiosError => ({
  response: {
    data: {
      errors,
    },
  },
});

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
describe('Connected ConfirmationPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', async () => {
    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;

    jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const { container, queryByTestId } = renderWithRedux(
      <ConfirmationPage token={VALID_TOKEN} />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(container).toMatchSnapshot();
  });
});

describe('Unconnected ConfirmationPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Trys to confirm valid token and navigates to `/chat`', async () => {
    const credentials: ITokenCredentials = { token: VALID_TOKEN };

    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;
    const spy = jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const confirmation = jest.fn(() => Promise.resolve());
    const resendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, queryByTestId } = render(
      <UnconnectedConfirmationPage
        confirmation={confirmation}
        resendConfirmationEmail={resendConfirmationEmail}
        token={credentials.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(confirmation).toHaveBeenCalledTimes(1);
    expect(confirmation).toHaveBeenCalledWith(credentials);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/chat');
  });

  it('Trys to confirm invalid token and shows error alert', async () => {
    const credentials: ITokenCredentials = { token: INVALID_TOKEN };

    const confirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const resendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, getByRole, queryByTestId } = render(
      <UnconnectedConfirmationPage
        confirmation={confirmation}
        resendConfirmationEmail={resendConfirmationEmail}
        token={credentials.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    const alert = getByRole('alert');

    expect(confirmation).toHaveBeenCalledTimes(1);
    expect(confirmation).toHaveBeenCalledWith(credentials);
    expect(alert).toHaveTextContent(/invalid token/i);
  });

  it('Trys to resend confirmation email and shows primary alert', async () => {
    const credentials: ITokenCredentials = { token: INVALID_TOKEN };

    const confirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const resendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, getByRole, queryByTestId, getByText } = render(
      <UnconnectedConfirmationPage
        confirmation={confirmation}
        resendConfirmationEmail={resendConfirmationEmail}
        token={credentials.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    fireEvent.click(getByText(/resend confirmation email/i));

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    const alert = getByRole('alert');

    expect(resendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(resendConfirmationEmail).toHaveBeenCalledWith(credentials);
    expect(alert).toHaveTextContent(
      /the confirmation email was resend! please check your email\./i,
    );
  });

  it('Trys to resend confirmation email and shows error alert', async () => {
    const credentials: ITokenCredentials = { token: INVALID_TOKEN };

    const confirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const resendConfirmationEmail = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );

    const { container, getByRole, queryByTestId, getByText } = render(
      <UnconnectedConfirmationPage
        confirmation={confirmation}
        resendConfirmationEmail={resendConfirmationEmail}
        token={credentials.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    fireEvent.click(getByText(/resend confirmation email/i));

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    const alert = getByRole('alert');

    expect(resendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(resendConfirmationEmail).toHaveBeenCalledWith(credentials);
    expect(alert).toHaveTextContent(/invalid token/i);
  });
});

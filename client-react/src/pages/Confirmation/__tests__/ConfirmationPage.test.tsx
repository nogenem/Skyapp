import React from 'react';

import * as router from '@reach/router';
import {
  render,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';

import type {
  IConfirmationRequestBody,
  IResendConfirmationRequestBody,
} from '~/requestsParts/auth';
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
  sendConfirmation: () => () => Promise.resolve(),
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
    const data: IConfirmationRequestBody = { token: VALID_TOKEN };

    const mockFunc = (async (
      to: string,
      options?: router.NavigateOptions<{}>,
    ) => {}) as router.NavigateFn;
    const spy = jest.spyOn(router, 'navigate').mockImplementationOnce(mockFunc);
    const sendConfirmation = jest.fn(() => Promise.resolve());
    const SendResendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, queryByTestId } = render(
      <UnconnectedConfirmationPage
        sendConfirmation={sendConfirmation}
        SendResendConfirmationEmail={SendResendConfirmationEmail}
        token={data.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).toHaveBeenCalledWith(data);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/chat');
  });

  it('Trys to confirm invalid token and shows error alert', async () => {
    const data: IConfirmationRequestBody = { token: INVALID_TOKEN };

    const sendConfirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const SendResendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, getByRole, queryByTestId } = render(
      <UnconnectedConfirmationPage
        sendConfirmation={sendConfirmation}
        SendResendConfirmationEmail={SendResendConfirmationEmail}
        token={data.token}
      />,
    );

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container: container as HTMLElement,
    }); // wait for the Spinner to disappear

    const alert = getByRole('alert');

    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).toHaveBeenCalledWith(data);
    expect(alert).toHaveTextContent(/invalid token/i);
  });

  it('Trys to resend confirmation email and shows primary alert', async () => {
    const data: IResendConfirmationRequestBody = { token: INVALID_TOKEN };

    const sendConfirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const SendResendConfirmationEmail = jest.fn(() => Promise.resolve());

    const { container, getByRole, queryByTestId, getByText } = render(
      <UnconnectedConfirmationPage
        sendConfirmation={sendConfirmation}
        SendResendConfirmationEmail={SendResendConfirmationEmail}
        token={data.token}
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

    expect(SendResendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(SendResendConfirmationEmail).toHaveBeenCalledWith(data);
    expect(alert).toHaveTextContent(
      /the confirmation email was resend! please check your email\./i,
    );
  });

  it('Trys to resend confirmation email and shows error alert', async () => {
    const data: IResendConfirmationRequestBody = { token: INVALID_TOKEN };

    const sendConfirmation = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );
    const SendResendConfirmationEmail = jest.fn(() =>
      Promise.reject(
        mockServerResponse({
          global: 'Invalid token',
        }),
      ),
    );

    const { container, getByRole, queryByTestId, getByText } = render(
      <UnconnectedConfirmationPage
        sendConfirmation={sendConfirmation}
        SendResendConfirmationEmail={SendResendConfirmationEmail}
        token={data.token}
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

    expect(SendResendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(SendResendConfirmationEmail).toHaveBeenCalledWith(data);
    expect(alert).toHaveTextContent(/invalid token/i);
  });
});

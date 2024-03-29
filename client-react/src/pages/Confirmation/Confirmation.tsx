import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Button } from '@material-ui/core';
import { RouteComponentProps, navigate } from '@reach/router';
import { AxiosError } from 'axios';

import { Alert, AuthContainer, Spinner } from '~/components';
import type { IErrors } from '~/components/Form';
import useObjState from '~/hooks/useObjState';
import {
  sendConfirmation as sendConfirmationAction,
  SendResendConfirmationEmail as SendResendConfirmationEmailAction,
} from '~/redux/user/actions';
import type {
  IConfirmationRequestBody,
  IResendConfirmationRequestBody,
} from '~/requestsParts/auth';
import handleServerErrors from '~/utils/handleServerErrors';

const STATES = {
  WAITING: 1,
  SENDING: 2,
  COMPLETED: 3,
} as const;

interface IOwnState {
  validatingToken: typeof STATES[keyof typeof STATES];
  resendingEmail: typeof STATES[keyof typeof STATES];
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  validatingToken: STATES.SENDING,
  resendingEmail: STATES.WAITING,
  errors: {},
};

const mapDispatchToProps = {
  sendConfirmation: sendConfirmationAction,
  SendResendConfirmationEmail: SendResendConfirmationEmailAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps extends RouteComponentProps {
  token?: string;
}

type TProps = TPropsFromRedux & OwnProps;

const Confirmation = ({
  token,
  sendConfirmation,
  SendResendConfirmationEmail,
}: TProps) => {
  const [state, setState] = useObjState<TState>(initialState);
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const isMounted = React.useRef(false);

  const handleResendEmail = async () => {
    try {
      setState({ resendingEmail: STATES.SENDING, errors: {} });
      const data: IResendConfirmationRequestBody = {
        token: token as string,
      };
      await SendResendConfirmationEmail(data);
      setState({ resendingEmail: STATES.COMPLETED, errors: {} });
    } catch (err) {
      setState({
        resendingEmail: STATES.COMPLETED,
        errors: handleServerErrors(err as AxiosError),
      });
    }
  };

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    const confirm = async () => {
      try {
        const data: IConfirmationRequestBody = {
          token: token as string,
        };
        await sendConfirmation(data);
        setState(() => {
          if (isMounted.current)
            return { validatingToken: STATES.COMPLETED, errors: {} };
          return {};
        });
        navigate('/chat');
      } catch (err) {
        setState({
          validatingToken: STATES.COMPLETED,
          errors: handleServerErrors(err as AxiosError),
        });
      }
    };
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isLoading =
    state.validatingToken === STATES.SENDING ||
    state.resendingEmail === STATES.SENDING;

  return (
    <>
      <AuthContainer title={trans('Messages:Token Confirmation')}>
        {!state.errors.global && (
          <>
            {state.validatingToken === STATES.SENDING && (
              <Alert bgcolor="primary.main" color="primary.contrastText">
                {trans('Messages:Validating your email...')}
              </Alert>
            )}
            {state.resendingEmail === STATES.SENDING && (
              <Alert bgcolor="primary.main" color="primary.contrastText">
                {trans('Messages:Resending confirmation email...')}
              </Alert>
            )}
            {state.resendingEmail === STATES.COMPLETED && (
              <Alert bgcolor="primary.main" color="primary.contrastText">
                {trans(
                  'Messages:The confirmation email was resend! Please check your email.',
                )}
              </Alert>
            )}
          </>
        )}

        {state.errors.global && (
          <>
            <Alert>{state.errors.global}</Alert>
            {state.resendingEmail === STATES.WAITING && (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleResendEmail}
              >
                {trans('Common:Resend confirmation email')}
              </Button>
            )}
          </>
        )}
      </AuthContainer>

      <Spinner show={isLoading} color="secondary" />
    </>
  );
};

export type { TProps, TState };
export const UnconnectedConfirmation = Confirmation;
export default connector(Confirmation);

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography, Button } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import { RouteComponentProps, navigate } from '@reach/router';

import { Alert, Spinner } from '~/components';
import useObjState from '~/hooks/useObjState';
import {
  confirmation as confirmationAction,
  resendConfirmationEmail as resendConfirmationEmailAction,
} from '~/redux/user/actions';
import type { ITokenCredentials } from '~/redux/user/types';
import handleServerErrors from '~/utils/handleServerErrors';

import useStyles from './useStyles';

const STATES = {
  WAITING: 1,
  SENDING: 2,
  COMPLETED: 3,
} as const;

interface IErrors {
  [x: string]: string;
}

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
  confirmation: confirmationAction,
  resendConfirmationEmail: resendConfirmationEmailAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps extends RouteComponentProps {
  token?: string;
}

type TProps = RouteComponentProps & TPropsFromRedux & OwnProps;

const Confirmation = ({
  token,
  confirmation,
  resendConfirmationEmail,
}: TProps) => {
  const classes = useStyles();
  const [state, setState] = useObjState<TState>(initialState);
  const isMounted = React.useRef(false);

  const handleResendEmail = async () => {
    try {
      setState({ resendingEmail: STATES.SENDING, errors: {} });
      const credentials: ITokenCredentials = {
        token: token as string,
      };
      await resendConfirmationEmail(credentials);
      setState({ resendingEmail: STATES.COMPLETED, errors: {} });
    } catch (err) {
      setState({
        resendingEmail: STATES.COMPLETED,
        errors: handleServerErrors(err),
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
    async function confirm() {
      try {
        const credentials: ITokenCredentials = {
          token: token as string,
        };
        await confirmation(credentials);
        setState(() => {
          if (isMounted.current)
            return { validatingToken: STATES.COMPLETED, errors: {} };
          return {};
        });
        navigate('/chat');
      } catch (err) {
        setState({
          validatingToken: STATES.COMPLETED,
          errors: handleServerErrors(err),
        });
      }
    }
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isLoading =
    state.validatingToken === STATES.SENDING ||
    state.resendingEmail === STATES.SENDING;

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.container}>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Token Confirmation
            </Typography>

            {!state.errors.global && (
              <>
                {state.validatingToken === STATES.SENDING && (
                  <Alert bgcolor="primary.main" color="primary.contrastText">
                    Validating your email...
                  </Alert>
                )}
                {state.resendingEmail === STATES.SENDING && (
                  <Alert bgcolor="primary.main" color="primary.contrastText">
                    Resending confirmation email...
                  </Alert>
                )}
                {state.resendingEmail === STATES.COMPLETED && (
                  <Alert bgcolor="primary.main" color="primary.contrastText">
                    The confirmation email was resend! Please check your email.
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
                    Resend Confirmation Email
                  </Button>
                )}
              </>
            )}
          </div>
        </Grid>
      </Grid>
      <Spinner show={isLoading} color="secondary" />
    </>
  );
};

export type { TProps, TState };
export const UnconnectedConfirmation = Confirmation;
export default connector(Confirmation);

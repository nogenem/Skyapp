import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Link } from '@material-ui/core';
import { Link as ReachLink, RouteComponentProps } from '@reach/router';

import { Alert, AuthContainer } from '~/components';
import { forgotPassword as forgotPasswordAction } from '~/redux/user/actions';
import type { IForgotPasswordCredentials } from '~/redux/user/types';

import { Form } from './Form';

const mapDispatchToProps = {
  forgotPassword: forgotPasswordAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const ForgotPassword = ({ forgotPassword }: TProps) => {
  const [success, setSuccess] = React.useState(false);

  const submit = async (credentials: IForgotPasswordCredentials) => {
    try {
      await forgotPassword(credentials);
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
      throw err; // propaga o erro pro Form
    }
  };

  return (
    <AuthContainer title="Forgot Password">
      {success && (
        <Alert bgcolor="secondary.main" color="secondary.contrastText">
          Email sent, please check your email account
        </Alert>
      )}
      <Form submit={submit} />

      <Grid container>
        <Grid item xs>
          <Link
            href="#"
            variant="body2"
            color="textPrimary"
            underline="always"
            component={ReachLink}
            to="/signup"
          >
            Sign Up
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="#"
            variant="body2"
            color="textPrimary"
            underline="always"
            component={ReachLink}
            to="/signin"
          >
            Sign In
          </Link>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export type { TProps };
export const UnconnectedForgotPassword = ForgotPassword;
export default connector(ForgotPassword);

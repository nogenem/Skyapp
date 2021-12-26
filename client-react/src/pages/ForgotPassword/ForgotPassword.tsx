import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Link } from '@material-ui/core';
import { Link as ReachLink, RouteComponentProps } from '@reach/router';

import { Alert, AuthContainer } from '~/components';
import { sendForgotPassword as sendForgotPasswordAction } from '~/redux/user/actions';
import type { IForgotPasswordRequestBody } from '~/requestsParts/auth';

import { Form } from './Form';

const mapDispatchToProps = {
  sendForgotPassword: sendForgotPasswordAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const ForgotPassword = ({ sendForgotPassword }: TProps) => {
  const [success, setSuccess] = React.useState(false);
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const submit = async (data: IForgotPasswordRequestBody) => {
    try {
      await sendForgotPassword(data);
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
      throw err; // propagate the error to the Form
    }
  };

  return (
    <AuthContainer title={trans('Messages:Forgot Password')}>
      {success && (
        <Alert bgcolor="secondary.main" color="secondary.contrastText">
          {trans('Messages:Email sent, please check your email account')}
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
            {trans('Common:Sign Up')}
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
            {trans('Sign In')}
          </Link>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export type { TProps };
export const UnconnectedForgotPassword = ForgotPassword;
export default connector(ForgotPassword);

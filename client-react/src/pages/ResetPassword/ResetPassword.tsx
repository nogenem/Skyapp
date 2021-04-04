import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Link } from '@material-ui/core';
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from '@reach/router';

import { AuthContainer } from '~/components';
import {
  validateToken as validateTokenAction,
  resetPassword as resetPasswordAction,
} from '~/redux/user/actions';
import type { IResetPasswordCredentials } from '~/redux/user/types';

import { Form } from './Form';

const mapDispatchToProps = {
  validateToken: validateTokenAction,
  resetPassword: resetPasswordAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps extends RouteComponentProps {
  token?: string;
}

type TProps = TPropsFromRedux & OwnProps;

const ResetPassword = ({ token, resetPassword }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const submit = async (credentials: IResetPasswordCredentials) => {
    await resetPassword({ ...credentials, token: token as string });
    navigate('/chat');
  };

  return (
    <AuthContainer title={trans('Messages:Reset Password')}>
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
            {trans('Common:Sign In')}
          </Link>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export type { TProps };
export const UnconnectedResetPassword = ResetPassword;
export default connector(ResetPassword);

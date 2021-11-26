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
import { sendSignIn as sendSignInAction } from '~/redux/user/actions';
import type { ISignInCredentials } from '~/redux/user/types';

import { Form } from './Form';

const mapDispatchToProps = {
  sendSignIn: sendSignInAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const SignIn = ({ sendSignIn }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const submit = async (credentials: ISignInCredentials) => {
    await sendSignIn(credentials);
    navigate('/chat');
  };

  return (
    <AuthContainer title={trans('Messages:Sign In')}>
      <Form submit={submit} />

      <Grid container>
        <Grid item xs>
          <Link
            href="#"
            variant="body2"
            color="textPrimary"
            underline="always"
            component={ReachLink}
            to="/forgot_password"
          >
            {trans('Common:Forgot password?')}
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="#"
            variant="body2"
            color="textPrimary"
            underline="always"
            component={ReachLink}
            to="/signup"
          >
            {trans("Common:Don't have an account? Sign Up")}
          </Link>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export type { TProps };
export const UnconnectedSignIn = SignIn;
export default connector(SignIn);

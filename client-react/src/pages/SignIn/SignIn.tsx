import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Link } from '@material-ui/core';
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from '@reach/router';

import { AuthContainer } from '~/components';
import { signIn as signInAction } from '~/redux/user/actions';
import type { ISignInCredentials } from '~/redux/user/types';

import { Form } from './Form';

const mapDispatchToProps = {
  signIn: signInAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const SignIn = ({ signIn }: TProps) => {
  const submit = async (credentials: ISignInCredentials) => {
    await signIn(credentials);
    navigate('/chat');
  };

  return (
    <AuthContainer title="Sign In">
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
            Forgot password?
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
            {"Don't have an account? Sign Up"}
          </Link>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export type { TProps };
export const UnconnectedSignIn = SignIn;
export default connector(SignIn);

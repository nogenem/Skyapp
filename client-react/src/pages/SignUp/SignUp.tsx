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
import { sendSignUp as sendSignUpAction } from '~/redux/user/actions';
import type { ISignUpCredentials } from '~/redux/user/types';

import { Form } from './Form';

const mapDispatchToProps = {
  sendSignUp: sendSignUpAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const SignUp = ({ sendSignUp }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const submit = async (credentials: ISignUpCredentials) => {
    await sendSignUp(credentials);
    navigate('/chat');
  };

  return (
    <AuthContainer title={trans('Messages:Sign Up')}>
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
export const UnconnectedSignUp = SignUp;
export default connector(SignUp);

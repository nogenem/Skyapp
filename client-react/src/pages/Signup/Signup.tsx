import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography, Link } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from '@reach/router';

import { signup as signupAction } from '~/redux/user/actions';
import type { ISignUpCredentials } from '~/redux/user/types';

import { Form } from './Form';
import useStyles from './useStyles';

const mapDispatchToProps = {
  signup: signupAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const Signup = ({ signup }: TProps) => {
  const classes = useStyles();

  const submit = async (credentials: ISignUpCredentials) => {
    await signup(credentials);
    navigate('/chat');
  };

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.container}>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

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
                to="/signin"
              >
                Sign In
              </Link>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  );
};

export type { TProps };
export const UnconnectedSignup = Signup;
export default connector(Signup);

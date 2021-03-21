import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography, Link } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from '@reach/router';

import { signin as signinAction } from '~/redux/user/actions';
import type { ISignInCredentials } from '~/redux/user/types';

import { Form } from './Form';
import useStyles from './useStyles';

const mapDispatchToProps = {
  signin: signinAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const Signin = ({ signin }: TProps) => {
  const classes = useStyles();

  const submit = async (credentials: ISignInCredentials) => {
    await signin(credentials);
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
            Sign in
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
                to="/signup"
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  );
};

export type { TProps };
export const UnconnectedSignin = Signin;
export default connector(Signin);

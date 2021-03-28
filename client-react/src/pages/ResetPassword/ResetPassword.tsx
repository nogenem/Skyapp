import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography, Link } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from '@reach/router';

import {
  validateToken as validateTokenAction,
  resetPassword as resetPasswordAction,
} from '~/redux/user/actions';
import type { IResetPasswordCredentials } from '~/redux/user/types';

import { Form } from './Form';
import useStyles from './useStyles';

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
  const classes = useStyles();

  const submit = async (credentials: IResetPasswordCredentials) => {
    await resetPassword({ ...credentials, token: token as string });
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
            Reset Password
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
        </div>
      </Grid>
    </Grid>
  );
};

export type { TProps };
export const UnconnectedResetPassword = ResetPassword;
export default connector(ResetPassword);

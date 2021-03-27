import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography, Link } from '@material-ui/core';
import { HelpOutlineSharp as HelpOutlineSharpIcon } from '@material-ui/icons';
import { Link as ReachLink, RouteComponentProps } from '@reach/router';

import { Alert } from '~/components';
import { forgotPassword as forgotPasswordAction } from '~/redux/user/actions';
import type { IForgotPasswordCredentials } from '~/redux/user/types';

import { Form } from './Form';
import useStyles from './useStyles';

const mapDispatchToProps = {
  forgotPassword: forgotPasswordAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const ForgotPassword = ({ forgotPassword }: TProps) => {
  const [success, setSuccess] = React.useState(false);
  const classes = useStyles();

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
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.container}>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <HelpOutlineSharpIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Forgot Password
          </Typography>

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
        </div>
      </Grid>
    </Grid>
  );
};

export type { TProps };
export const UnconnectedForgotPassword = ForgotPassword;
export default connector(ForgotPassword);

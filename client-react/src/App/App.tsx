import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CssBaseline } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';

import { UnauthenticatedNavBar, Router, Spinner } from '~/components';
import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import {
  SignUp,
  SignIn,
  Confirmation,
  Redirect,
  Chat,
  ForgotPassword,
  ResetPassword,
} from '~/pages';
import { validateToken as validateTokenAction } from '~/redux/user/actions';

import './styles.css';
import useStyles from './useStyles';

const mapDispatchToProps = {
  validateToken: validateTokenAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

function App({ validateToken }: TProps) {
  const [loading, setLoading] = React.useState(true);
  const classes = useStyles();

  React.useEffect(() => {
    async function signin() {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN);
      if (!token) return false;
      try {
        await validateToken({ token });
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
      }
      return false;
    }

    signin().then(() => setLoading(false));
  }, [validateToken]);

  if (loading) return <Spinner show />;

  return (
    <>
      <CssBaseline />
      <UnauthenticatedNavBar />
      <main className={classes.content}>
        <Router>
          <SignUp path="/signup" />
          <SignIn path="/signin" />
          <Confirmation path="/confirmation/:token" />
          <ForgotPassword path="/forgot_password" />
          <ResetPassword path="/reset_password/:token" />
          <Redirect default />
        </Router>
        <Router isPrivate>
          <Chat path="/chat" />
          <Confirmation path="/confirmation/:token" />
          <Redirect default />
        </Router>
      </main>
    </>
  );
}

export type { TProps };
export const UnconnectedApp = App;
export default connector(App);

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CssBaseline } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';

import {
  UnauthenticatedNavBar,
  Router,
  Spinner,
  ThemeProvider,
} from '~/components';
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
import { sendValidateToken as sendValidateTokenAction } from '~/redux/user/actions';

import './styles.css';
import useStyles from './useStyles';

const mapDispatchToProps = {
  sendValidateToken: sendValidateTokenAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = RouteComponentProps & TPropsFromRedux;

const App = ({ sendValidateToken }: TProps) => {
  const [loading, setLoading] = React.useState(true);
  const classes = useStyles();

  React.useEffect(() => {
    const signin = async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN);
      if (!token) return false;
      try {
        await sendValidateToken({ token });
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
      }
      return false;
    };

    signin().then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner show />;

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export type { TProps };
export const UnconnectedApp = App;
export default connector(App);

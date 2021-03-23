import React from 'react';

import { CssBaseline } from '@material-ui/core';

import { Router } from '~/components';
import { SignUp, SignIn, Confirmation } from '~/pages';

import './styles.css';
import useStyles from './useStyles';

function App() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <main className={classes.content}>
        <Router>
          <SignUp path="/signup" />
          <SignIn path="/signin" />
          <Confirmation path="/confirmation/:token" />
        </Router>
      </main>
    </>
  );
}

export default App;

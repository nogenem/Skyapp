import React from 'react';

import { CssBaseline } from '@material-ui/core';

import { Router } from '~/components';
import { Signup, Signin } from '~/pages';

import './styles.css';
import useStyles from './useStyles';

function App() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <main className={classes.content}>
        <Router>
          <Signup path="/signup" />
          <Signin path="/signin" />
        </Router>
      </main>
    </>
  );
}

export default App;

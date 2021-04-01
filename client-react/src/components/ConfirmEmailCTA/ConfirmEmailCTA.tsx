import React from 'react';

import { Card, CardHeader, CardContent, Typography } from '@material-ui/core';

import useStyles from './useStyles';

const ConfirmEmailCTA = () => {
  const classes = useStyles();

  return (
    <div className={classes.content}>
      <Card raised>
        <CardHeader title="Confirm your email" />
        <CardContent>
          <Typography variant="body1" component="p">
            Please, follow the instructions in the email that we sent to you.{' '}
            <br />
            That is a necessary step for you to be able to use our chat system.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailCTA;

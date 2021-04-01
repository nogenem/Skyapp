import React from 'react';

import { Grid, Avatar, Typography } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';

import useStyles from './useStyles';

interface IOwnProps {
  title: string;
  children: React.ReactNode;
}

type TProps = IOwnProps;

const AuthContainer = ({ title, children }: TProps) => {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.container}>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {title}
          </Typography>

          {children}
        </div>
      </Grid>
    </Grid>
  );
};

export type { TProps };
export default AuthContainer;

import React from 'react';

import { Paper } from '@material-ui/core';

import { UserInfoMenu } from '../UserInfoMenu';
import useStyles from './useStyles';

interface IOwnProps {}

type TProps = IOwnProps;

const Sidebar = (props: TProps) => {
  const classes = useStyles();

  return (
    <Paper square className={classes.container} elevation={8}>
      <UserInfoMenu />
    </Paper>
  );
};

export type { TProps };
export default Sidebar;

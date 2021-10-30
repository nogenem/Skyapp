import React from 'react';

import { Paper } from '@material-ui/core';

import { IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const SystemMessage = ({ message }: TProps) => {
  const classes = useStyles();
  return (
    <div className={classes.system_message_wrapper}>
      <Paper className={`${classes.system_messages}`}>{message.body}</Paper>
    </div>
  );
};

export type { TProps };
export default SystemMessage;

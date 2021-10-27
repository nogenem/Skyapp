import React from 'react';

import { IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  messages: IMessage[];
}

type TProps = IOwnProps;

const MessagesContainer = ({ messages }: TProps) => {
  const classes = useStyles();

  return <div className={classes.container}>MessagesContainer</div>;
};

export type { TProps };
export default MessagesContainer;

import React from 'react';

import { IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  messages: IMessage[];
}

type TProps = IOwnProps;

const MessagesContainer = ({ messages }: TProps) => {
  const classes = useStyles();

  const renderMessages = () => {
    const ret = [];
    for (let i = 0; i < messages.length; i++) {
      ret.push(<div key={messages[i]._id}>{messages[i].body}</div>);
    }
    return ret;
  };

  return <div className={classes.container}>{renderMessages()}</div>;
};

export type { TProps };
export default MessagesContainer;

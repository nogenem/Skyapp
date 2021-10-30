import React from 'react';

import { Typography } from '@material-ui/core';

import { IMessage } from '~/redux/chat/types';
import newLine2LineBreak from '~/utils/newLine2LineBreak';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const TextMessage = ({ message }: TProps) => {
  return (
    <Typography component="p" variant="body2">
      {newLine2LineBreak(message.body as string)}
    </Typography>
  );
};

export type { TProps };
export default TextMessage;

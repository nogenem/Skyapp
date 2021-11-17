import React from 'react';
import Linkify from 'react-linkify';

import { Typography, Link } from '@material-ui/core';

import { IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const TextMessage = ({ message }: TProps) => {
  const classes = useStyles();

  // https://github.com/tasti/react-linkify/issues/107#issuecomment-947905494
  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={decoratedHref}
          key={key}
        >
          {decoratedText}
        </Link>
      )}
    >
      <Typography
        component="p"
        variant="body2"
        className={classes.text_message}
      >
        {message.body as string}
      </Typography>
    </Linkify>
  );
};

export type { TProps };
export default TextMessage;

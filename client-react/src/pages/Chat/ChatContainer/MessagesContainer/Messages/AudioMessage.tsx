import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

import { IAttachment, IMessage } from '~/redux/chat/types';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const AudioMessage = ({ message }: TProps) => {
  const body = message.body as IAttachment;
  let url = body.path;
  if (!url.startsWith('blob:') && !url.startsWith('http'))
    url = `${process.env.REACT_APP_BASE_API_URL}${body.path}`;

  return <ReactAudioPlayer src={url} autoPlay={false} controls />;
};

export type { TProps };
export default AudioMessage;

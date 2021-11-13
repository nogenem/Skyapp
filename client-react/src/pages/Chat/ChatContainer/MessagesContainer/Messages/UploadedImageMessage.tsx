import React from 'react';

import { IAttachment, IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const UploadedImageMessage = ({ message }: TProps) => {
  const classes = useStyles();

  const body = message.body as IAttachment;
  const name = body.originalName;
  let url = body.path;
  if (!url.startsWith('blob:') && !url.startsWith('http'))
    url = `${process.env.REACT_APP_BASE_API_URL}${body.path}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name}
      type={body.mimeType}
      title={name}
    >
      <img src={url} alt={name} className={classes.image_message_img} />
    </a>
  );
};

export type { TProps };
export default UploadedImageMessage;

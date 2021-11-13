import React from 'react';

import { Typography } from '@material-ui/core';
import { InsertDriveFile as InsertDriveFileIcon } from '@material-ui/icons';

import { IAttachment, IMessage } from '~/redux/chat/types';

import useStyles from './useStyles';

interface IOwnProps {
  message: IMessage;
}

type TProps = IOwnProps;

const UploadedFileMessage = ({ message }: TProps) => {
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
      className={classes.file_message_link}
    >
      <InsertDriveFileIcon className={classes.file_message_icon} />
      <Typography component="p" variant="body2" align="center" noWrap>
        {name}
      </Typography>
    </a>
  );
};

export type { TProps };
export default UploadedFileMessage;

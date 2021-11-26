import React from 'react';
import { useTranslation } from 'react-i18next';

import { Paper, Typography } from '@material-ui/core';
import {
  Close as CloseIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from '@material-ui/icons';
import fileSize from 'filesize';

import TmpFile from '~/classes/TmpFile';

import useStyles from './useStyles';

interface IOwnProps {
  file: TmpFile;
  removeFile: (id: string) => void;
}

type TProps = IOwnProps;

const FilePreview = ({ file, removeFile }: TProps) => {
  const { t: trans, i18n } = useTranslation(['Common']);
  const classes = useStyles();

  const name = file.name();
  const size = fileSize(file.size(), { locale: i18n.language });

  const handleClick = () => {
    removeFile(file.id());
  };

  return (
    <Paper className={classes.previewFileContainer} title={name}>
      <div
        className={classes.previewImageCloseContainer}
        title={`${trans('Common:Remove')} ${name}`}
        onClick={handleClick}
      >
        <CloseIcon />
      </div>
      <div className="file-preview">
        <InsertDriveFileIcon />
        <Typography variant="body1" noWrap>
          <strong>{name}</strong>
        </Typography>
        <Typography variant="body2">{size}</Typography>
      </div>
    </Paper>
  );
};

export type { TProps };
export default FilePreview;

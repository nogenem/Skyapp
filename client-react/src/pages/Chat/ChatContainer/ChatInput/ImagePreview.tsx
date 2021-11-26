import React from 'react';
import { useTranslation } from 'react-i18next';

import { Close as CloseIcon } from '@material-ui/icons';

import TmpFile from '~/classes/TmpFile';
import TmpImage from '~/classes/TmpImage';

import useStyles from './useStyles';

interface IOwnProps {
  file: TmpFile;
  removeFile: (id: string) => void;
}

type TProps = IOwnProps;

const ImagePreview = ({ file, removeFile }: TProps) => {
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  const image = file as TmpImage;
  const name = image.name();

  const handleClick = () => {
    image.revokeSrc();
    removeFile(file.id());
  };

  return (
    <div className={classes.previewFileContainer}>
      <div
        className={classes.previewImageCloseContainer}
        title={`${trans('Common:Remove')} ${name}`}
        onClick={handleClick}
      >
        <CloseIcon />
      </div>
      <img src={image.src()} alt={name} title={name} />
    </div>
  );
};

export type { TProps };
export default ImagePreview;

import React, { MouseEvent, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
} from '@material-ui/icons';

import RecordingMenuItem from './RecordingMenuItem';
import useStyles from './useStyles';

interface IOwnProps {
  addFiles: (files: File[]) => void;
}

type TProps = IOwnProps;

const ChatMoreOptsMenu = ({ addFiles }: TProps) => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t: trans } = useTranslation(['Messages']);
  const classes = useStyles();

  const handleMenuOpen = (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuClose = (event: MouseEvent<Element>, reason: string) => {
    if (!!event) {
      event.preventDefault();
      event.stopPropagation();
    }

    closeMenu();
  };

  const onFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();

    closeMenu();
  };

  const onChangeFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      event.preventDefault();
      event.stopPropagation();

      const files: File[] = [];
      for (let i = 0; i < event.target.files.length; i++) {
        files.push(event.target.files[i]);
      }
      addFiles(files);

      event.target.value = '';
    }
  };

  const saveAudio = (chunks: Blob[]) => {
    if (chunks.length > 0) {
      const audioBlob = new Blob(chunks, { type: 'audio/x-mpeg-3' });
      const audioFile = new File([audioBlob], getAudioName(), {
        type: audioBlob.type,
        lastModified: new Date().getTime(),
      });
      addFiles([audioFile]);
    }
    closeMenu();
  };

  return (
    <>
      <IconButton
        className={classes.icon}
        aria-label={trans('Messages:More options')}
        title={trans('Messages:More options')}
        aria-haspopup="true"
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        keepMounted
        transformOrigin={{
          vertical: 110,
          horizontal: 0,
        }}
        id="more-options-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onFileUploadClick}>
          <ListItemIcon>
            <AttachFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={trans('Messages:Add files')} />
          <input
            type="file"
            name="files"
            multiple
            ref={fileInputRef}
            className={classes.fileInput}
            onChange={onChangeFileInput}
          />
        </MenuItem>
        <RecordingMenuItem saveAudio={saveAudio} onClose={closeMenu} />
      </Menu>
    </>
  );
};

const getAudioName = () => {
  const date = new Date();

  let isoString = date.toISOString();
  isoString = isoString.split('.')[0];
  isoString = isoString.replace(/:/gi, '_');

  return `audio_${isoString}.mp3`;
};

export type { TProps };
export default ChatMoreOptsMenu;

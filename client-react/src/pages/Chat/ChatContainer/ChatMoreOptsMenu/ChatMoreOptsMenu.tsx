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

import { HAS_TOO_MANY_FILES, UPLOAD_FILE_IS_TOO_BIG } from '~/constants/errors';
import FILE_UPLOAD_LIMITS from '~/constants/file_upload_limits';
import { MESSAGE_TYPES } from '~/constants/message_types';
import { Toast } from '~/utils/Toast';

import RecordingMenuItem from './RecordingMenuItem';
import useStyles from './useStyles';

interface IOwnProps {
  handleSendingFiles: (filesData: FormData) => void;
}

type TProps = IOwnProps;

const ChatMoreOptsMenu = ({ handleSendingFiles }: TProps) => {
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
      // validation
      if (event.target.files.length > FILE_UPLOAD_LIMITS.files) {
        Toast.error({
          html: trans(HAS_TOO_MANY_FILES, { count: FILE_UPLOAD_LIMITS.files }),
        });
        event.preventDefault();
        event.stopPropagation();
        event.target.value = '';

        return false;
      }

      for (let i = 0; i < event.target.files.length; i++) {
        if (event.target.files[i].size > FILE_UPLOAD_LIMITS.fileSize) {
          Toast.error({
            html: trans(UPLOAD_FILE_IS_TOO_BIG, {
              count: FILE_UPLOAD_LIMITS.fileSize / 1024 / 1024,
            }),
          });
          event.preventDefault();
          event.stopPropagation();
          event.target.value = '';

          return false;
        }
      }

      const filesData = new FormData();
      for (let i = 0; i < event.target.files.length; i++) {
        filesData.append('files', event.target.files[i]);
      }
      filesData.append('type', `${MESSAGE_TYPES.UPLOADED_FILE}`);
      handleSendingFiles(filesData);
      event.target.value = '';
    }
  };

  const saveAudio = (chunks: Blob[]) => {
    if (chunks.length > 0) {
      const audioBlob = new Blob(chunks, { type: 'audio/x-mpeg-3' });

      const filesData = new FormData();
      filesData.append('files', audioBlob, getAudioName());
      filesData.append('type', `${MESSAGE_TYPES.UPLOADED_AUDIO}`);
      handleSendingFiles(filesData);
    }
    closeMenu();
  };

  return (
    <>
      <IconButton
        className={classes.icon}
        classes={{
          root: classes.iconRoot,
        }}
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
          vertical: 110, //60~150
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

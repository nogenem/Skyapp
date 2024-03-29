import React, { MouseEvent, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton, InputAdornment } from '@material-ui/core';
import {
  Send as SendIcon,
  SentimentSatisfiedAlt as EmojiIcon,
} from '@material-ui/icons';

import TmpFile from '~/classes/TmpFile';
import TmpImage from '~/classes/TmpImage';
import { TextInput } from '~/components';
import { HAS_TOO_MANY_FILES, UPLOAD_FILE_IS_TOO_BIG } from '~/constants/errors';
import FILE_UPLOAD_LIMITS from '~/constants/file_upload_limits';
import useObjState from '~/hooks/useObjState';
import type { IMessage } from '~/redux/chat/types';
import { Toast } from '~/utils/Toast';

import { ChatMoreOptsMenu } from '../ChatMoreOptsMenu';
import EmojiMenu from './EmojiMenu';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';
import useStyles from './useStyles';

import './styles.css';

interface IOwnState {
  message: string;
  files: TmpFile[];
  isDisabled: boolean;
  isSubmitting: boolean;
}
type TState = IOwnState;

const initialState: TState = {
  message: '',
  files: [],
  isDisabled: true,
  isSubmitting: false,
};

interface IOwnProps {
  channelId?: string;
  editingMessage?: IMessage;
  handleSubmit: (message: string) => void;
  handleSendingFiles: (filesData: FormData) => void;
  startEditingLoggedUserLastestMessage: () => void;
  stopEditingMessage: () => void;
}

type TProps = IOwnProps;

const ChatInput = ({
  channelId,
  editingMessage,
  handleSubmit,
  handleSendingFiles,
  startEditingLoggedUserLastestMessage,
  stopEditingMessage,
}: TProps) => {
  const [state, setState] = useObjState(initialState);
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const inputRef = React.useRef<HTMLInputElement>();
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const onSubmit = () => {
    setState({ isSubmitting: true });
    if (state.files.length > 0) {
      const filesData = new FormData();
      for (let i = 0; i < state.files.length; i++) {
        filesData.append('files', state.files[i].file());
      }
      handleSendingFiles(filesData);
    }

    const message = state.message.trim();
    if (!!message) {
      handleSubmit(message);
    }

    state.files.forEach(file => {
      if (file.type().startsWith('image/')) {
        const image = file as TmpImage;
        image.revokeSrc();
      }
    });

    setState(initialState);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isDisabled = event.target.value.trim() === '';
    const message = event.target.value;
    setState({
      message,
      isDisabled,
    });

    if (isDisabled && !!editingMessage) {
      stopEditingMessage();
    }
  };

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();

      onSubmit();
    } else if (event.shiftKey && event.key === 'ArrowUp') {
      startEditingLoggedUserLastestMessage();
    } else if (event.key === 'Escape' && !!editingMessage) {
      stopEditingMessage();
    }
  };

  const addFiles = (files: File[]) => {
    // validation
    if (files.length + state.files.length > FILE_UPLOAD_LIMITS.files) {
      Toast.error({
        html: trans(HAS_TOO_MANY_FILES, { count: FILE_UPLOAD_LIMITS.files }),
      });

      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > FILE_UPLOAD_LIMITS.fileSize) {
        Toast.error({
          html: trans(UPLOAD_FILE_IS_TOO_BIG, {
            count: FILE_UPLOAD_LIMITS.fileSize / 1024 / 1024,
          }),
        });

        return;
      }
    }

    const tmpFiles = files.map(file => {
      if (file.type.startsWith('image/')) {
        return new TmpImage(file);
      }
      return new TmpFile(file);
    });

    // stash the files
    setState(old => ({
      files: [...old.files, ...tmpFiles],
      isDisabled: false,
    }));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEmojiMenuOpen = (event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleEmojiMenuClose = (event: MouseEvent<Element>, reason: string) => {
    if (!!event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setAnchorEl(null);
    setTimeout(() => {
      const input = inputRef.current as HTMLInputElement;
      input.selectionStart = input.selectionEnd = input.value.length;
      input.focus();
    }, 0);
  };

  const onSelectEmoji = (emoji: string) => {
    setState(oldState => ({
      message: oldState.message + emoji,
      isDisabled: false,
    }));
  };

  const previews = React.useMemo(() => {
    const removeFile = (id: string) => {
      setState(old => ({
        files: old.files.filter(file => file.id() !== id),
      }));
    };

    return state.files.map(file => {
      if (file.type().startsWith('image/')) {
        return (
          <ImagePreview key={file.id()} file={file} removeFile={removeFile} />
        );
      } else {
        return (
          <FilePreview key={file.id()} file={file} removeFile={removeFile} />
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.files]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [channelId]);

  React.useEffect(() => {
    if (editingMessage) {
      setState({
        message: editingMessage.body as string,
        files: [],
        isDisabled: false,
      });

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      setState({
        message: '',
        files: [],
        isDisabled: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessage]);

  return (
    <form className={classes.container} onSubmit={handleFormSubmit}>
      <div className={classes.inputContainer}>
        {!!state.files.length && (
          <div className={classes.previewContainer}>
            {previews}
            <div className={classes.previewIconContainer}>
              <ChatMoreOptsMenu addFiles={addFiles} />
            </div>
          </div>
        )}
        <TextInput
          id="chat-send-input"
          label={trans('Messages:Type here')}
          className={classes.sendInput}
          multiline
          maxRows="3"
          value={state.message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          margin="normal"
          variant="outlined"
          disabled={state.isSubmitting}
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  title={trans('Messages:Add emoji')}
                  aria-label={trans('Messages:Add emoji')}
                  size="small"
                  onClick={handleEmojiMenuOpen}
                >
                  <EmojiIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className={classes.inputIconContainer}>
        {(!!state.message || !!state.files.length) && (
          <IconButton
            type="submit"
            className={classes.icon}
            aria-label={trans('Common:Send')}
            disabled={state.isDisabled || state.isSubmitting}
          >
            <SendIcon />
          </IconButton>
        )}
        {!state.message && !state.files.length && (
          <ChatMoreOptsMenu addFiles={addFiles} />
        )}
      </div>
      <EmojiMenu
        anchor={anchorEl}
        onSelectEmoji={onSelectEmoji}
        handleMenuClose={handleEmojiMenuClose}
      />
    </form>
  );
};

export type { TProps, TState };
export default ChatInput;

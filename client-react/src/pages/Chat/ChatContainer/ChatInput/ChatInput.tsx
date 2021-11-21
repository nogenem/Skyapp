import React, { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';

import { TmpFile, TmpImage } from '~/classes';
import { TextInput } from '~/components';
import { HAS_TOO_MANY_FILES, UPLOAD_FILE_IS_TOO_BIG } from '~/constants/errors';
import FILE_UPLOAD_LIMITS from '~/constants/file_upload_limits';
import useObjState from '~/hooks/useObjState';
import { Toast } from '~/utils/Toast';

import { ChatMoreOptsMenu } from '../ChatMoreOptsMenu';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';
import useStyles from './useStyles';

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
  handleSubmit: (message: string) => void;
  handleSendingFiles: (filesData: FormData) => void;
}

type TProps = IOwnProps;

const ChatInput = ({ channelId, handleSubmit, handleSendingFiles }: TProps) => {
  const [state, setState] = useObjState(initialState);
  const inputRef = React.useRef<HTMLInputElement>();
  const { t: trans } = useTranslation(['Messages']);
  const classes = useStyles();

  const onSubmit = async () => {
    setState({ isSubmitting: true });
    if (state.files.length > 0) {
      const filesData = new FormData();
      for (let i = 0; i < state.files.length; i++) {
        filesData.append('files', state.files[i].file());
      }
      await handleSendingFiles(filesData);
    }

    const message = state.message.trim();
    if (!!message) {
      await handleSubmit(message);
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

  return (
    <form className={classes.container} onSubmit={handleFormSubmit}>
      <div className={classes.inputContainer}>
        {!!state.files.length && (
          <div className={classes.previewContainer}>
            {previews}
            <ChatMoreOptsMenu addFiles={addFiles} />
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
        />
      </div>

      {(!!state.message || !!state.files.length) && (
        <IconButton
          type="submit"
          className={classes.icon}
          classes={{
            root: classes.iconRoot,
          }}
          aria-label="send"
          disabled={state.isDisabled || state.isSubmitting}
        >
          <SendIcon />
        </IconButton>
      )}
      {!state.message && !state.files.length && (
        <ChatMoreOptsMenu addFiles={addFiles} />
      )}
    </form>
  );
};

export type { TProps };
export default ChatInput;

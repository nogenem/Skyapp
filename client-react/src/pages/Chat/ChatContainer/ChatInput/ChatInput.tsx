import React, { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';

import { TextInput } from '~/components';
import useObjState from '~/hooks/useObjState';

import { ChatMoreOptsMenu } from '../ChatMoreOptsMenu';
import useStyles from './useStyles';

interface IOwnState {
  message: string;
  files: File[];
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
  handleSubmit: (message: string) => void;
  handleSendingFiles: (filesData: FormData) => void;
}

type TProps = IOwnProps;

const ChatInput = ({ handleSubmit, handleSendingFiles }: TProps) => {
  const [state, setState] = useObjState(initialState);
  const { t: trans } = useTranslation(['Messages']);

  const classes = useStyles();

  const onSubmit = async () => {
    setState({ isSubmitting: true });
    if (state.files.length > 0) {
      const filesData = new FormData();
      for (let i = 0; i < state.files.length; i++) {
        filesData.append('files', state.files[i]);
      }
      await handleSendingFiles(filesData);
    }

    const message = state.message.trim();
    if (!!message) {
      await handleSubmit(message);
    }
    setState(initialState);
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
    setState(old => ({
      files: [...old.files, ...files],
      isDisabled: false,
    }));
  };

  return (
    <form className={classes.container} onSubmit={handleFormSubmit}>
      {/* TODO: Add a better file preview ;p */}
      <span>{state.files.length}</span>
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
      />
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

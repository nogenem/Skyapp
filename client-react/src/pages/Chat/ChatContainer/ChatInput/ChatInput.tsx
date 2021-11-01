import React from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';

import { TextInput } from '~/components';

import { ChatMoreOptsMenu } from '../ChatMoreOptsMenu';
import useStyles from './useStyles';

interface IOwnProps {
  handleSubmit: (message: string) => void;
  handleSendingFiles: (filesData: FormData) => void;
}

type TProps = IOwnProps;

const ChatInput = ({ handleSubmit, handleSendingFiles }: TProps) => {
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [isDisabled, setIsDisabled] = React.useState(true);
  const { t: trans } = useTranslation(['Messages']);

  const classes = useStyles();

  const onSubmit = () => {
    const message = currentMessage.trim();
    if (!!message) {
      handleSubmit(message);
    }
    setCurrentMessage('');
    setIsDisabled(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const disabled = event.target.value.trim() === '';
    const message = event.target.value;
    setCurrentMessage(message);
    setIsDisabled(disabled);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();

      onSubmit();
    }
  };

  return (
    <form className={classes.container} onSubmit={onSubmit}>
      <TextInput
        id="chat-send-input"
        label={trans('Messages:Type here')}
        className={classes.sendInput}
        multiline
        maxRows="3"
        value={currentMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        margin="normal"
        variant="outlined"
      />
      {currentMessage !== '' && (
        <IconButton
          type="submit"
          className={classes.icon}
          classes={{
            root: classes.iconRoot,
          }}
          aria-label="send"
          disabled={isDisabled}
        >
          <SendIcon />
        </IconButton>
      )}
      {currentMessage === '' && (
        <ChatMoreOptsMenu handleSendingFiles={handleSendingFiles} />
      )}
    </form>
  );
};

export type { TProps };
export default ChatInput;

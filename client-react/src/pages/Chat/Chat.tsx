import React from 'react';

import { Button } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';

import api from '~/services/api';

type TProps = RouteComponentProps;

const Chat = (props: TProps) => {
  // TODO: Remove later
  const handleTest = async () => {
    const user = await api.chat.test();
    console.log(user);
  };

  return (
    <div>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleTest}
      >
        Test Chat Route
      </Button>
    </div>
  );
};

export type { TProps };
export default Chat;

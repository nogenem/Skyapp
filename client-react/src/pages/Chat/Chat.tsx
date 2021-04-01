import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Button } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';

import { ConfirmEmailCTA } from '~/components';
import { IAppState } from '~/redux/store';
import { getConfirmed } from '~/redux/user/reducer';
import api from '~/services/api';

const mapStateToProps = (state: IAppState) => ({
  isUserEmailConfirmed: !!getConfirmed(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const Chat = ({ isUserEmailConfirmed }: TProps) => {
  // TODO: Remove later
  const handleTest = async () => {
    const user = await api.chat.test();
    console.log(user);
  };

  if (!isUserEmailConfirmed) return <ConfirmEmailCTA />;

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
export const UnconnectedChat = Chat;
export default connector(Chat);

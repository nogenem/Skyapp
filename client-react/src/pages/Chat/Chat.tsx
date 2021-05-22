import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

import { ConfirmEmailCTA } from '~/components';
import { IAppState } from '~/redux/store';
import { getConfirmed } from '~/redux/user/reducer';

import { Sidebar } from './Sidebar';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  isUserEmailConfirmed: !!getConfirmed(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const Chat = ({ isUserEmailConfirmed }: TProps) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Sidebar isUserEmailConfirmed={isUserEmailConfirmed} />
      <div className={classes.rightContainer}>
        {!isUserEmailConfirmed && <ConfirmEmailCTA />}
      </div>
    </div>
  );
};

export type { TProps };
export const UnconnectedChat = Chat;
export default connector(Chat);

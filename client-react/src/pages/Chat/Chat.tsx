import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

import { ConfirmEmailCTA } from '~/components';
import useMediaQuery from '~/hooks/useMediaQuery';
import { getActiveChannel } from '~/redux/chat/reducer';
import { IAppState } from '~/redux/store';
import { getConfirmed } from '~/redux/user/reducer';

import { ChatContainer } from './ChatContainer';
import { Sidebar } from './Sidebar';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  isUserEmailConfirmed: !!getConfirmed(state),
  activeChannel: getActiveChannel(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const Chat = ({ isUserEmailConfirmed, activeChannel }: TProps) => {
  const isSmall = useMediaQuery('(max-width: 875px)');
  const classes = useStyles();

  const hiddenClassName = isSmall && !activeChannel ? 'hidden' : '';
  return (
    <div className={classes.container}>
      <Sidebar
        isUserEmailConfirmed={isUserEmailConfirmed}
        isSmall={isSmall}
        activeChannelId={activeChannel?._id}
      />
      <div className={`${classes.rightContainer} ${hiddenClassName}`}>
        {!isUserEmailConfirmed && <ConfirmEmailCTA />}
        {isUserEmailConfirmed && (
          <ChatContainer isSmall={isSmall} activeChannel={activeChannel} />
        )}
      </div>
    </div>
  );
};

export type { TProps };
export const UnconnectedChat = Chat;
export default connector(Chat);

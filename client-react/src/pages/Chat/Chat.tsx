import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from '@reach/router';

import { ConfirmEmailCTA } from '~/components';
import { USER_STATUS } from '~/constants/user_status';
import useMediaQuery from '~/hooks/useMediaQuery';
import useVisibility from '~/hooks/useVisibility';
import { selectActiveChannelId } from '~/redux/chat/selectors';
import { IAppState } from '~/redux/store';
import { emitUserStatusChanged as emitUserStatusChangedAction } from '~/redux/user/actions';
import { selectUserConfirmed, selectUserStatus } from '~/redux/user/selectors';

import { ChatContainer } from './ChatContainer';
import { Sidebar } from './Sidebar';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  isUserEmailConfirmed: !!selectUserConfirmed(state),
  activeChannelId: selectActiveChannelId(state),
  loggedUserStatus: selectUserStatus(state),
});
const mapDispatchToProps = {
  emitUserStatusChanged: emitUserStatusChangedAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps;

const Chat = ({
  isUserEmailConfirmed,
  activeChannelId,
  loggedUserStatus,
  emitUserStatusChanged,
}: TProps) => {
  const isSmall = useMediaQuery('(max-width: 875px)');
  const classes = useStyles();

  const isVisible = useVisibility();
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    if (!isVisible && loggedUserStatus === USER_STATUS.ACTIVE) {
      timeoutRef.current = setTimeout(() => {
        emitUserStatusChanged(USER_STATUS.TMP_AWAY);
      }, 5 * 60 * 1000); // 5min
    } else if (isVisible && loggedUserStatus === USER_STATUS.TMP_AWAY) {
      emitUserStatusChanged(USER_STATUS.ACTIVE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const hiddenClassName = isSmall && !activeChannelId ? 'hidden' : '';
  return (
    <div className={classes.container}>
      <Sidebar
        isUserEmailConfirmed={isUserEmailConfirmed}
        isSmall={isSmall}
        activeChannelId={activeChannelId}
      />
      <div className={`${classes.rightContainer} ${hiddenClassName}`}>
        {!isUserEmailConfirmed && <ConfirmEmailCTA />}
        {isUserEmailConfirmed && (
          <ChatContainer isSmall={isSmall} activeChannelId={activeChannelId} />
        )}
      </div>
    </div>
  );
};

export type { TProps };
export const UnconnectedChat = Chat;
export default connector(Chat);

import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { IconButton, Typography } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';

import { ChatAvatar } from '~/components';
import { USER_STATUS } from '~/constants/user_status';
import {
  selectActiveChannelIsGroup,
  selectOtherUsersFromActiveChannel,
} from '~/redux/chat/selectors';
import type { IAppState } from '~/redux/store';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  activeChannelIsGroup: !!selectActiveChannelIsGroup(state),
  otherUsers: selectOtherUsersFromActiveChannel(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  showGoBackButton: boolean;
  onGoBack: () => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const ChatHeader = ({
  showGoBackButton,
  onGoBack,
  otherUsers,
  activeChannelIsGroup,
}: TProps) => {
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  let names: string = otherUsers.reduce((prev, curr) => {
    return prev + curr.nickname + ', ';
  }, '');
  names = names.substr(0, names.length - 2);
  const nParticipants = `${otherUsers.length} ${trans('Common:participants')}`;

  return (
    <div className={classes.container}>
      {showGoBackButton && (
        <IconButton
          classes={{
            root: classes.backIconRoot,
          }}
          aria-label={trans('Common:Go back')}
          onClick={onGoBack}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <ChatAvatar
        online={activeChannelIsGroup || otherUsers[0].online}
        status={
          activeChannelIsGroup ? USER_STATUS.ACTIVE : otherUsers[0].status
        }
        isGroup={activeChannelIsGroup}
      />
      <div className={classes.textContainer}>
        <Typography
          component="span"
          variant="subtitle1"
          noWrap
          color="inherit"
          title={names}
        >
          {names}
        </Typography>
        {!activeChannelIsGroup && !!otherUsers[0].thoughts && (
          <Typography
            component="span"
            variant="caption"
            noWrap
            color="textSecondary"
            title={otherUsers[0].thoughts}
          >
            {otherUsers[0].thoughts}
          </Typography>
        )}
        {activeChannelIsGroup && (
          <Typography
            component="span"
            variant="caption"
            noWrap
            color="textSecondary"
            title={nParticipants}
          >
            {nParticipants}
          </Typography>
        )}
      </div>
    </div>
  );
};

export type { TProps };
export const UnconnectedChatHeader = ChatHeader;
export default connector(ChatHeader);

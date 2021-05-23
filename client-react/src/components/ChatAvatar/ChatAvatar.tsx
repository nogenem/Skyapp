import React from 'react';

import { Avatar as MuiAvatar } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

import type { TUserStatus } from '~/constants/user_status';

import { UserStatusDot } from '../UserStatusDot';
import useStyles from './useStyles';

const defaultProps = {
  showInvisible: false,
};

interface IOwnProps {
  online: boolean;
  status: TUserStatus;
}

type TProps = IOwnProps & typeof defaultProps;

const ChatAvatar = ({ online, status, showInvisible }: TProps) => {
  const classes = useStyles();

  return (
    <div style={{ position: 'relative' }}>
      <MuiAvatar>
        <AccountCircleIcon className={classes.icon} />
      </MuiAvatar>
      <span className={classes.dotContainer}>
        <UserStatusDot
          online={online}
          status={status}
          showInvisible={showInvisible}
        />
      </span>
    </div>
  );
};

ChatAvatar.defaultProps = defaultProps;

export type { TProps };
export default ChatAvatar;

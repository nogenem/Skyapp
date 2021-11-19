import React from 'react';

import { Avatar as MuiAvatar } from '@material-ui/core';
import {
  AccountCircle as AccountCircleIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
} from '@material-ui/icons';

import type { TUserStatus } from '~/constants/user_status';

import { UserStatusDot } from '../UserStatusDot';
import useStyles from './useStyles';

const defaultProps = {
  isGroup: false,
  showInvisible: false,
};

interface IOwnProps {
  online: boolean;
  status: TUserStatus;
  color?: 'inherit' | 'primary' | 'secondary' | 'disabled' | 'action' | 'error';
}

type TProps = IOwnProps & typeof defaultProps;

const ChatAvatar = ({
  online,
  status,
  color,
  isGroup,
  showInvisible,
}: TProps) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <MuiAvatar>
        {!isGroup ? (
          <AccountCircleIcon className={classes.icon} color={color} />
        ) : (
          <SupervisedUserCircleIcon className={classes.icon} color={color} />
        )}
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

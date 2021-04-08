import React from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar as MuiAvatar, Badge } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

import { USER_STATUS, USER_STATUS_2_TEXT } from '~/constants/user_status';
import type { TUserStatus } from '~/constants/user_status';

import useStyles from './useStyles';

interface IOwnProps {
  online: boolean;
  status: TUserStatus;
}

type TProps = IOwnProps;

const ChatAvatar = ({ online, status }: TProps) => {
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  const title = getDotTitle(online, status);

  return (
    <Badge
      overlap="circle"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      variant="dot"
      color="secondary"
      title={trans(`Common:${title}`)}
      classes={{
        root: classes.badge,
        dot: classes.dotBadge,
        colorSecondary: getDotStyle(classes, online, status),
        anchorOriginBottomRightCircle: classes.anchorOriginBottomRightCircle,
      }}
    >
      <MuiAvatar>
        <AccountCircleIcon />
      </MuiAvatar>
    </Badge>
  );
};

const getDotTitle = (online: boolean, status: TUserStatus): string => {
  if (!online) return 'Offline';
  return USER_STATUS_2_TEXT[status];
};

const getDotStyle = (
  classes: ReturnType<typeof useStyles>,
  online: boolean,
  status: TUserStatus,
): string => {
  if (!online) return classes.dotBadge_offline;
  switch (status) {
    case USER_STATUS.ACTIVE:
      return classes.dotBadge_active;
    case USER_STATUS.AWAY:
      return classes.dotBadge_away;
    case USER_STATUS.DO_NOT_DISTURB:
      return classes.dotBadge_do_not_disturb;
    case USER_STATUS.INVISIBLE:
      return classes.dotBadge_invisible;
    default:
      return '';
  }
};

export type { TProps };
export default ChatAvatar;

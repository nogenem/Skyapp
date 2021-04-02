import React from 'react';

import { Avatar as MuiAvatar, Badge } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';

import useStyles from './useStyles';

interface IOwnProps {
  online: boolean;
}

type TProps = IOwnProps;

const ChatAvatar = ({ online }: TProps) => {
  const classes = useStyles();

  return (
    <Badge
      overlap="circle"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      variant="dot"
      color="secondary"
      classes={{
        root: classes.badge,
        dot: classes.dotBadge,
        colorSecondary: online
          ? classes.dotBadge_online
          : classes.dotBadge_offline,
        anchorOriginBottomRightCircle: classes.anchorOriginBottomRightCircle,
      }}
    >
      <MuiAvatar>
        <AccountCircleIcon />
      </MuiAvatar>
    </Badge>
  );
};

export type { TProps };
export default ChatAvatar;

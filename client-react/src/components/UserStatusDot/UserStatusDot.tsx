import React from 'react';
import { useTranslation } from 'react-i18next';

import { USER_STATUS, USER_STATUS_2_TEXT } from '~/constants/user_status';
import type { TUserStatus } from '~/constants/user_status';

import useStyles from './useStyles';

const defaultProps = {
  className: '',
};

interface IOwnProps {
  online?: boolean;
  status: TUserStatus;
}

type TProps = IOwnProps & typeof defaultProps;

const UserStatusDot = ({ online, status, className }: TProps) => {
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  const dotClass = React.useMemo(() => getDotStyle(classes, status, online), [
    classes,
    online,
    status,
  ]);
  const title = getDotTitle(status, online);

  return (
    <span
      className={`${classes.dot} ${dotClass} ${className}`}
      title={trans(`Common:${title}`)}
    />
  );
};

UserStatusDot.defaultProps = defaultProps;

const getDotTitle = (status: TUserStatus, online?: boolean): string => {
  if (!online) return 'Offline';
  return USER_STATUS_2_TEXT[status];
};

const getDotStyle = (
  classes: ReturnType<typeof useStyles>,
  status: TUserStatus,
  online?: boolean,
): string => {
  if (!online) return classes.dot_offline;
  switch (status) {
    case USER_STATUS.ACTIVE:
      return classes.dot_active;
    case USER_STATUS.AWAY:
      return classes.dot_away;
    case USER_STATUS.DO_NOT_DISTURB:
      return classes.dot_do_not_disturb;
    case USER_STATUS.INVISIBLE:
      return classes.dot_invisible;
    default:
      return '';
  }
};

export type { TProps };
export default UserStatusDot;

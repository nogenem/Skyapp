import React from 'react';
import { useTranslation } from 'react-i18next';

import useStyles from './useStyles';

const NewMsgsMessage = () => {
  const classes = useStyles();
  const { t: trans } = useTranslation(['Messages']);
  return (
    <div className={`${classes.new_messages} ${classes.fancy}`}>
      {trans('Messages:New Messages')}
    </div>
  );
};

export default NewMsgsMessage;

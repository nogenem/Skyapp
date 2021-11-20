import React from 'react';

import useStyles from './useStyles';

interface IOwnProps {
  date: Date;
}

type TProps = IOwnProps;

const DateMessage = ({ date }: TProps) => {
  const classes = useStyles();
  return (
    <div className={`${classes.date} ${classes.fancy}`}>
      {date.toLocaleDateString()}
    </div>
  );
};

export type { TProps };
export default DateMessage;

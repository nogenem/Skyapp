import React from 'react';

import { CircularProgress, CircularProgressProps } from '@material-ui/core';

import useStyles from './useStyles';

const defaultProps = {
  show: false,
  containerStyle: {} as React.CSSProperties,
};

interface OwnProps extends CircularProgressProps {}
type Props = OwnProps & typeof defaultProps;

const Spinner = ({ show, containerStyle, ...props }: Props) => {
  const classes = useStyles();

  if (!show) return null;
  return (
    <div
      data-testid="spinner_div"
      className={classes.root}
      style={containerStyle}
    >
      <CircularProgress color="primary" thickness={5} {...props} />
    </div>
  );
};

Spinner.defaultProps = defaultProps;

export type { Props };
export default Spinner;

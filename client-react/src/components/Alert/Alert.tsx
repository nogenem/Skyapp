import React from 'react';

import { Box, BoxProps } from '@material-ui/core';

import useStyles from './useStyles';

const defaultProps = {
  className: '',
};

interface IOwnProps extends BoxProps {
  children: React.ReactNode;
}

type TProps = IOwnProps & typeof defaultProps;

const Alert = ({ children, className, ...props }: TProps) => {
  const classes = useStyles();
  return (
    <Box
      role="alert"
      bgcolor="error.main"
      color="error.contrastText"
      p={2}
      mb={2}
      mt={1}
      className={`${classes.root} ${className}`}
      {...props}
    >
      {children}
    </Box>
  );
};

Alert.defaultProps = defaultProps;

export type { TProps };
export default Alert;

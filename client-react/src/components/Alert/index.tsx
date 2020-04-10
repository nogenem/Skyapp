import React from "react";

import { Box, BoxProps } from "@material-ui/core";

import useStyles from "./useStyles";

const defaultProps = {
  className: ""
};

interface OwnProps extends BoxProps {
  children: React.ReactNode;
}

export type Props = OwnProps & typeof defaultProps;

const Alert = ({ children, className, ...props }: Props) => {
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

export default Alert;

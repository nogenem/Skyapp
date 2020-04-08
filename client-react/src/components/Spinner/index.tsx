import React from "react";

import { CircularProgress, CircularProgressProps } from "@material-ui/core";
import PropTypes from "prop-types";

import useStyles from "./useStyles";

interface OwnProps extends CircularProgressProps {
  show: boolean;
  containerStyle?: React.CSSProperties;
}

const Spinner = ({ show, containerStyle, ...props }: OwnProps) => {
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

Spinner.propTypes = {
  // ownProps
  show: PropTypes.bool,
  containerStyle: PropTypes.object
};

Spinner.defaultProps = {
  // ownProps
  show: false,
  containerStyle: {}
};

export default Spinner;

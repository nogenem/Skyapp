import React from 'react';

import { TextField, TextFieldProps } from '@material-ui/core';

import useStyles from './useStyles';

interface IOwnProps {}

type TProps = IOwnProps & TextFieldProps;

const TextInput = ({ classes: inputClasses, ...rest }: TProps) => {
  const classes = useStyles();
  return (
    <TextField
      {...rest}
      classes={{
        ...inputClasses,
        root:
          classes.textInput +
          (!!inputClasses && !!inputClasses.root
            ? ` ${inputClasses.root}`
            : ''),
      }}
    />
  );
};

export type { TProps };
export default TextInput;

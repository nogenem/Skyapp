import React from 'react';

import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import isEmail from 'validator/lib/isEmail';

import { Alert } from '~/components';
import { Form as BaseForm } from '~/components/Form';
import type {
  IErrors,
  IGetInputByName,
  TState as TBaseFormState,
} from '~/components/Form';
import {
  INVALID_EMAIL,
  CANT_BE_BLANK,
  fieldIsTooShort,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import type { ISignInCredentials } from '~/redux/user/types';

import useStyles from './useStyles';

const FORM_ID = 'sign-in-form';

interface IOwnProps {
  submit: (data: ISignInCredentials) => Promise<void>;
}

type TProps = IOwnProps;

function Form({ submit }: TProps) {
  const classes = useStyles();

  const getData = (getInputByName: IGetInputByName): ISignInCredentials => ({
    email: getInputByName('email').value.trim(),
    password: getInputByName('password').value.trim(),
    rememberMe: getInputByName('remember_me').checked,
  });

  const validate = (data: ISignInCredentials) => {
    const errors = {} as IErrors;

    if (!isEmail(data.email)) errors.email = INVALID_EMAIL;

    if (!data.password) errors.password = CANT_BE_BLANK;
    else if (data.password.length < MIN_PASSWORD_LEN)
      errors.password = fieldIsTooShort(MIN_PASSWORD_LEN);

    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextField
        id={`${FORM_ID}-email`}
        name="email"
        label="Email"
        autoComplete="email"
        type="email"
        fullWidth
        required
        error={!!errors.email}
        helperText={errors.email}
        variant="outlined"
        margin="normal"
      />
      <TextField
        id={`${FORM_ID}-password`}
        name="password"
        label="Password"
        autoComplete="password"
        type="password"
        fullWidth
        required
        error={!!errors.password}
        helperText={errors.password}
        variant="outlined"
        margin="normal"
      />
      <FormControlLabel
        control={<Checkbox name="remember_me" color="primary" />}
        label="Remember me"
      />

      <Button
        className={classes.submit}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        Sign In
      </Button>
    </>
  );

  return (
    <BaseForm<ISignInCredentials>
      id={FORM_ID}
      submit={submit}
      getData={getData}
      validate={validate}
      render={renderForm}
    />
  );
}

export type { TProps };
export default Form;

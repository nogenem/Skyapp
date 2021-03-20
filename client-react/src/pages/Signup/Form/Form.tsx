import React from 'react';

import { TextField, Button } from '@material-ui/core';
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
  PASSWORDS_MUST_MATCH,
  fieldIsTooShort,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import type { ICredentials } from '~/redux/user/types';

import useStyles from './useStyles';

const FORM_ID = 'signup-form';

interface IOwnProps {
  submit: (data: ICredentials) => Promise<void>;
}

type TProps = IOwnProps;

function Form({ submit }: TProps) {
  const classes = useStyles();

  const getData = (getInputByName: IGetInputByName): ICredentials => ({
    nickname: getInputByName('nickname').value.trim(),
    email: getInputByName('email').value.trim(),
    password: getInputByName('password').value.trim(),
    passwordConfirmation: getInputByName('passwordConfirmation').value.trim(),
  });

  const validate = (data: ICredentials) => {
    const errors = {} as IErrors;

    if (!data.nickname) errors.nickname = CANT_BE_BLANK;

    if (!isEmail(data.email)) errors.email = INVALID_EMAIL;

    if (!data.password) errors.password = CANT_BE_BLANK;
    else if (data.password.length < MIN_PASSWORD_LEN)
      errors.password = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (!data.passwordConfirmation) errors.passwordConfirmation = CANT_BE_BLANK;
    else if (data.passwordConfirmation.length < MIN_PASSWORD_LEN)
      errors.passwordConfirmation = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (data.password !== data.passwordConfirmation)
      errors.passwordConfirmation = PASSWORDS_MUST_MATCH;
    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextField
        id={`${FORM_ID}-nickname`}
        name="nickname"
        label="Nickname"
        autoComplete="nickname"
        fullWidth
        required
        error={!!errors.nickname}
        helperText={errors.nickname}
        variant="outlined"
        margin="normal"
      />
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
      <TextField
        id={`${FORM_ID}-passwordConfirmation`}
        name="passwordConfirmation"
        label="Password Confirmation"
        autoComplete="passwordConfirmation"
        type="password"
        fullWidth
        required
        error={!!errors.passwordConfirmation}
        helperText={errors.passwordConfirmation}
        variant="outlined"
        margin="normal"
      />

      <Button
        className={classes.submit}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        Sign Up
      </Button>
    </>
  );

  return (
    <BaseForm<ICredentials>
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

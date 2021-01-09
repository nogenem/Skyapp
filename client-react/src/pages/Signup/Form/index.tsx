import React from 'react';

import { TextField, Button } from '@material-ui/core';
import isEmail from 'validator/lib/isEmail';

import { Alert } from '~/components';
import BaseForm, {
  IErrors,
  IGetInputByName,
  State as BaseFormState,
} from '~/components/Form';
import {
  INVALID_EMAIL,
  CANT_BE_BLANK,
  PASSWORDS_MUST_MATCH,
  fieldIsTooShort,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import { ICredentials } from '~/redux/user/actions';

import useStyles from './useStyles';

const FORM_ID = 'signup-form';

interface OwnProps {
  submit: (data: ICredentials) => Promise<void>;
}

export type Props = OwnProps;

function Form({ submit }: Props) {
  const classes = useStyles();

  const getData = (getInputByName: IGetInputByName): ICredentials => ({
    nickname: getInputByName('nickname').value.trim(),
    email: getInputByName('email').value.trim(),
    password: getInputByName('password').value.trim(),
    password_confirmation: getInputByName('password_confirmation').value.trim(),
  });

  const validate = (data: ICredentials) => {
    const errors = {} as IErrors;

    if (!data.nickname) errors.nickname = CANT_BE_BLANK;

    if (!isEmail(data.email)) errors.email = INVALID_EMAIL;

    if (!data.password) errors.password = CANT_BE_BLANK;
    else if (data.password.length < MIN_PASSWORD_LEN)
      errors.password = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (!data.password_confirmation)
      errors.password_confirmation = CANT_BE_BLANK;
    else if (data.password_confirmation.length < MIN_PASSWORD_LEN)
      errors.password_confirmation = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (data.password !== data.password_confirmation)
      errors.password_confirmation = PASSWORDS_MUST_MATCH;
    return errors;
  };

  const renderForm = ({ errors }: BaseFormState) => (
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
        id={`${FORM_ID}-password_confirmation`}
        name="password_confirmation"
        label="Password Confirmation"
        autoComplete="password_confirmation"
        type="password"
        fullWidth
        required
        error={!!errors.password_confirmation}
        helperText={errors.password_confirmation}
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

export default Form;

import React from 'react';

import { TextField, Button } from '@material-ui/core';

import { Alert } from '~/components';
import { Form as BaseForm } from '~/components/Form';
import type {
  IErrors,
  IGetInputByName,
  TState as TBaseFormState,
} from '~/components/Form';
import {
  CANT_BE_BLANK,
  PASSWORDS_MUST_MATCH,
  fieldIsTooShort,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import type { IResetPasswordCredentials } from '~/redux/user/types';

import useStyles from './useStyles';

const FORM_ID = 'reset-password-form';

interface IOwnProps {
  submit: (data: IResetPasswordCredentials) => Promise<void>;
}

type TProps = IOwnProps;

function Form({ submit }: TProps) {
  const classes = useStyles();

  const getData = (
    getInputByName: IGetInputByName,
  ): IResetPasswordCredentials => ({
    newPassword: getInputByName('newPassword').value.trim(),
    newPasswordConfirmation: getInputByName(
      'newPasswordConfirmation',
    ).value.trim(),
    token: '',
  });

  const validate = (data: IResetPasswordCredentials) => {
    const errors = {} as IErrors;

    if (!data.newPassword) errors.newPassword = CANT_BE_BLANK;
    else if (data.newPassword.length < MIN_PASSWORD_LEN)
      errors.newPassword = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (!data.newPasswordConfirmation)
      errors.newPasswordConfirmation = CANT_BE_BLANK;
    else if (data.newPasswordConfirmation.length < MIN_PASSWORD_LEN)
      errors.newPasswordConfirmation = fieldIsTooShort(MIN_PASSWORD_LEN);

    if (data.newPassword !== data.newPasswordConfirmation)
      errors.newPasswordConfirmation = PASSWORDS_MUST_MATCH;
    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextField
        id={`${FORM_ID}-newPassword`}
        name="newPassword"
        label="New Password"
        autoComplete="newPassword"
        type="password"
        fullWidth
        required
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        variant="outlined"
        margin="normal"
      />
      <TextField
        id={`${FORM_ID}-newPasswordConfirmation`}
        name="newPasswordConfirmation"
        label="New Password Confirmation"
        autoComplete="newPasswordConfirmation"
        type="password"
        fullWidth
        required
        error={!!errors.newPasswordConfirmation}
        helperText={errors.newPasswordConfirmation}
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
        Reset Password
      </Button>
    </>
  );

  return (
    <BaseForm<IResetPasswordCredentials>
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

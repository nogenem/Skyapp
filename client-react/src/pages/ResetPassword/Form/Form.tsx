import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@material-ui/core';

import { Alert, TextInput } from '~/components';
import { Form as BaseForm } from '~/components/Form';
import type {
  IErrors,
  IGetInputByName,
  TState as TBaseFormState,
} from '~/components/Form';
import {
  CANT_BE_BLANK,
  PASSWORDS_MUST_MATCH,
  FIELD_IS_TOO_SHORT,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import type { IResetPasswordRequestBody } from '~/requestsParts/auth';

import useStyles from './useStyles';

const FORM_ID = 'reset-password-form';

interface IOwnProps {
  submit: (data: IResetPasswordRequestBody) => Promise<void>;
}

type TProps = IOwnProps;

const Form = ({ submit }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Errors']);
  const classes = useStyles();

  const getData = (
    getInputByName: IGetInputByName,
  ): IResetPasswordRequestBody => ({
    newPassword: getInputByName('newPassword').value.trim(),
    newPasswordConfirmation: getInputByName(
      'newPasswordConfirmation',
    ).value.trim(),
    token: '',
  });

  const validate = (data: IResetPasswordRequestBody) => {
    const errors = {} as IErrors;

    if (!data.newPassword) errors.newPassword = trans(CANT_BE_BLANK);
    else if (data.newPassword.length < MIN_PASSWORD_LEN)
      errors.newPassword = trans(FIELD_IS_TOO_SHORT, {
        count: MIN_PASSWORD_LEN,
      });

    if (!data.newPasswordConfirmation)
      errors.newPasswordConfirmation = trans(CANT_BE_BLANK);
    else if (data.newPasswordConfirmation.length < MIN_PASSWORD_LEN)
      errors.newPasswordConfirmation = trans(FIELD_IS_TOO_SHORT, {
        count: MIN_PASSWORD_LEN,
      });

    if (data.newPassword !== data.newPasswordConfirmation)
      errors.newPasswordConfirmation = trans(PASSWORDS_MUST_MATCH);
    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextInput
        id={`${FORM_ID}-newPassword`}
        name="newPassword"
        label={trans('Common:New password')}
        autoComplete="newPassword"
        type="password"
        fullWidth
        required
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        variant="outlined"
        margin="normal"
      />
      <TextInput
        id={`${FORM_ID}-newPasswordConfirmation`}
        name="newPasswordConfirmation"
        label={trans('Common:New password confirmation')}
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
        {trans('Common:Reset password')}
      </Button>
    </>
  );

  return (
    <BaseForm<IResetPasswordRequestBody>
      id={FORM_ID}
      submit={submit}
      getData={getData}
      validate={validate}
      render={renderForm}
    />
  );
};

export type { TProps };
export default Form;

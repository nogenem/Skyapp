import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@material-ui/core';
import isEmail from 'validator/lib/isEmail';

import { Alert, TextInput } from '~/components';
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
  FIELD_IS_TOO_SHORT,
} from '~/constants/errors';
import { MIN_PASSWORD_LEN } from '~/constants/validation_limits';
import type { ISignUpCredentials } from '~/redux/user/types';

import useStyles from './useStyles';

const FORM_ID = 'sign-up-form';

interface IOwnProps {
  submit: (data: ISignUpCredentials) => Promise<void>;
}

type TProps = IOwnProps;

const Form = ({ submit }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Errors']);
  const classes = useStyles();

  const getData = (getInputByName: IGetInputByName): ISignUpCredentials => ({
    nickname: getInputByName('nickname').value.trim(),
    email: getInputByName('email').value.trim(),
    password: getInputByName('password').value.trim(),
    passwordConfirmation: getInputByName('passwordConfirmation').value.trim(),
  });

  const validate = (data: ISignUpCredentials) => {
    const errors = {} as IErrors;

    if (!data.nickname) errors.nickname = trans(CANT_BE_BLANK);

    if (!isEmail(data.email)) errors.email = trans(INVALID_EMAIL);

    if (!data.password) errors.password = trans(CANT_BE_BLANK);
    else if (data.password.length < MIN_PASSWORD_LEN)
      errors.password = trans(FIELD_IS_TOO_SHORT, { count: MIN_PASSWORD_LEN });

    if (!data.passwordConfirmation)
      errors.passwordConfirmation = trans(CANT_BE_BLANK);
    else if (data.passwordConfirmation.length < MIN_PASSWORD_LEN)
      errors.passwordConfirmation = trans(FIELD_IS_TOO_SHORT, {
        count: MIN_PASSWORD_LEN,
      });

    if (data.password !== data.passwordConfirmation)
      errors.passwordConfirmation = trans(PASSWORDS_MUST_MATCH);
    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
      <TextInput
        id={`${FORM_ID}-nickname`}
        name="nickname"
        label={trans('Common:Nickname')}
        autoComplete="nickname"
        fullWidth
        required
        error={!!errors.nickname}
        helperText={errors.nickname}
        variant="outlined"
        margin="normal"
      />
      <TextInput
        id={`${FORM_ID}-email`}
        name="email"
        label={trans('Common:Email')}
        autoComplete="email"
        type="email"
        fullWidth
        required
        error={!!errors.email}
        helperText={errors.email}
        variant="outlined"
        margin="normal"
      />
      <TextInput
        id={`${FORM_ID}-password`}
        name="password"
        label={trans('Common:Password')}
        autoComplete="password"
        type="password"
        fullWidth
        required
        error={!!errors.password}
        helperText={errors.password}
        variant="outlined"
        margin="normal"
      />
      <TextInput
        id={`${FORM_ID}-passwordConfirmation`}
        name="passwordConfirmation"
        label={trans('Common:Password Confirmation')}
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
        {trans('Common:Sign up')}
      </Button>
    </>
  );

  return (
    <BaseForm<ISignUpCredentials>
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

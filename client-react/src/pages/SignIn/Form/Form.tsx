import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FormControlLabel, Checkbox } from '@material-ui/core';
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
  FIELD_IS_TOO_SHORT,
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
  const { t: trans } = useTranslation(['Common', 'Errors']);
  const classes = useStyles();

  const getData = (getInputByName: IGetInputByName): ISignInCredentials => ({
    email: getInputByName('email').value.trim(),
    password: getInputByName('password').value.trim(),
    rememberMe: getInputByName('remember_me').checked,
  });

  const validate = (data: ISignInCredentials) => {
    const errors = {} as IErrors;

    if (!isEmail(data.email)) errors.email = trans(INVALID_EMAIL);

    // TODO: Think a better way to translate these errors...
    //  If i leave it like this, they wouldn't be updated if the user
    //  changes the language...
    if (!data.password) errors.password = trans(CANT_BE_BLANK);
    else if (data.password.length < MIN_PASSWORD_LEN)
      errors.password = trans(FIELD_IS_TOO_SHORT, { count: MIN_PASSWORD_LEN });

    return errors;
  };

  const renderForm = ({ errors }: TBaseFormState) => (
    <>
      {errors.global && <Alert>{errors.global}</Alert>}
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
      <FormControlLabel
        control={<Checkbox name="remember_me" color="primary" />}
        label={trans('Common:Remember me')}
      />

      <Button
        className={classes.submit}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        {trans('Common:Sign in')}
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

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
import { INVALID_EMAIL } from '~/constants/errors';
import type { IForgotPasswordCredentials } from '~/redux/user/types';

import useStyles from './useStyles';

const FORM_ID = 'forgot-password-form';

interface IOwnProps {
  submit: (data: IForgotPasswordCredentials) => Promise<void>;
}

type TProps = IOwnProps;

const Form = ({ submit }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Errors']);
  const classes = useStyles();

  const getData = (
    getInputByName: IGetInputByName,
  ): IForgotPasswordCredentials => ({
    email: getInputByName('email').value.trim(),
  });

  const validate = (data: IForgotPasswordCredentials) => {
    const errors = {} as IErrors;

    if (!isEmail(data.email)) errors.email = trans(INVALID_EMAIL);

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

      <Button
        className={classes.submit}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
      >
        {trans('Common:Send email')}
      </Button>
    </>
  );

  return (
    <BaseForm<IForgotPasswordCredentials>
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

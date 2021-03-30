import axios from 'axios';

import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
} from '~/redux/user/types';

export const END_POINTS = {
  auth: {
    signUp: 'api/auth/signup',
    signIn: 'api/auth/signin',
    confirmation: 'api/auth/confirmation',
    resendConfirmationEmail: 'api/auth/resend_confirmation_email',
    validateToken: 'api/auth/validate_token',
    forgotPassword: 'api/auth/forgot_password',
    resetPassword: 'api/auth/reset_password',
  },
  chat: {
    // TODO: Remove later
    test: 'api/chat/test',
  },
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

export default {
  auth: {
    signUp: (credentials: ISignUpCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signUp, { ...credentials })
        .then(res => res.data),
    signIn: (credentials: ISignInCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.signIn, { ...credentials })
        .then(res => res.data),
    confirmation: (credentials: ITokenCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.confirmation, { ...credentials })
        .then(res => res.data),
    resendConfirmationEmail: (credentials: ITokenCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.resendConfirmationEmail, { ...credentials })
        .then(res => res.data),
    validateToken: (credentials: ITokenCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.validateToken, { ...credentials })
        .then(res => res.data),
    forgotPassword: (credentials: IForgotPasswordCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.forgotPassword, { ...credentials })
        .then(res => res.data),
    resetPassword: (credentials: IResetPasswordCredentials) =>
      axiosInstance
        .post(END_POINTS.auth.resetPassword, { ...credentials })
        .then(res => res.data),
  },
  chat: {
    // TODO: Remove later
    test: () =>
      axiosInstance.post(END_POINTS.chat.test, {}).then(res => res.data),
  },
};

import axios from 'axios';

import type { INewGroupCredentials, IOtherUser } from '~/redux/chat/types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IChangeThoughtsCredentials,
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
  user: {
    changeStatus: 'api/user/change_status',
    changeThoughts: 'api/user/change_thoughts',
  },
  chat: {
    createChannelWith: 'api/chat/private',
    createGroupChannel: 'api/chat/group',
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
  user: {
    changeStatus: (credentials: IChangeStatusCredentials) =>
      axiosInstance
        .post(END_POINTS.user.changeStatus, { ...credentials })
        .then(res => res.data),
    changeThoughts: (credentials: IChangeThoughtsCredentials) =>
      axiosInstance
        .post(END_POINTS.user.changeThoughts, { ...credentials })
        .then(res => res.data),
  },
  chat: {
    createChannelWith: (otherUser: IOtherUser) =>
      axiosInstance
        .post(END_POINTS.chat.createChannelWith, { _id: otherUser._id })
        .then(res => res.data),
    createGroupChannel: (credentials: INewGroupCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.createGroupChannel, { ...credentials })
        .then(res => res.data),
  },
};

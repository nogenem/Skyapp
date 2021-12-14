import axios from 'axios';

import type {
  IDeleteMessageCredentials,
  IEditMessageCredentials,
  IFetchMessagesCredentials,
  ILeaveGroupCredentials,
  INewGroupCredentials,
  IOtherUser,
  ISendFilesCredentials,
  ISendMessageCredentials,
  IUpdateGroupCredentials,
} from '~/redux/chat/types';
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
    updateStatus: 'api/user/status',
    updateThoughts: 'api/user/thoughts',
  },
  channel: {
    private: {
      store: 'api/channel/private',
    },
    group: {
      store: 'api/channel/group',
      update: (channelId: string) => `api/channel/group/${channelId}`,
      leave: (channelId: string) => `api/channel/group/${channelId}/leave`,
    },
  },
  message: {
    all: (channelId: string) => `api/channel/${channelId}/messages`,
    storeMessage: (channelId: string) => `api/channel/${channelId}/messages`,
    storeFiles: (channelId: string) => `api/channel/${channelId}/files`,
    updateBody: (channelId: string, messageId: string) =>
      `api/channel/${channelId}/messages/${messageId}`,
    delete: (channelId: string, messageId: string) =>
      `api/channel/${channelId}/messages/${messageId}`,
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
    updateStatus: (credentials: IChangeStatusCredentials) =>
      axiosInstance
        .patch(END_POINTS.user.updateStatus, { ...credentials })
        .then(res => res.data),
    updateThoughts: (credentials: IChangeThoughtsCredentials) =>
      axiosInstance
        .patch(END_POINTS.user.updateThoughts, { ...credentials })
        .then(res => res.data),
  },
  channel: {
    private: {
      store: (otherUser: IOtherUser) =>
        axiosInstance
          .post(END_POINTS.channel.private.store, { _id: otherUser._id })
          .then(res => res.data),
    },
    group: {
      store: (credentials: INewGroupCredentials) =>
        axiosInstance
          .post(END_POINTS.channel.group.store, { ...credentials })
          .then(res => res.data),
      update: ({
        channel_id: channelId,
        ...credentials
      }: IUpdateGroupCredentials) =>
        axiosInstance
          .patch(END_POINTS.channel.group.update(channelId), {
            ...credentials,
          })
          .then(res => res.data),
      leave: ({ channel_id: channelId }: ILeaveGroupCredentials) =>
        axiosInstance
          .post(END_POINTS.channel.group.leave(channelId), {})
          .then(res => res.data),
    },
  },
  message: {
    all: ({
      channel_id: channelId,
      ...credentials
    }: IFetchMessagesCredentials) =>
      axiosInstance
        .get(END_POINTS.message.all(channelId), {
          params: credentials,
        })
        .then(res => res.data),
    storeMessage: ({
      channel_id: channelId,
      ...credentials
    }: ISendMessageCredentials) =>
      axiosInstance
        .post(END_POINTS.message.storeMessage(channelId), {
          ...credentials,
        })
        .then(res => res.data),
    storeFiles: ({ channel_id: channelId, files }: ISendFilesCredentials) =>
      axiosInstance
        .post(END_POINTS.message.storeFiles(channelId), files)
        .then(res => res.data),
    updateBody: ({ message, ...credentials }: IEditMessageCredentials) =>
      axiosInstance
        .patch(END_POINTS.message.updateBody(message.channel_id, message._id), {
          ...credentials,
        })
        .then(res => res.data),
    delete: ({ message }: IDeleteMessageCredentials) =>
      axiosInstance
        .delete(END_POINTS.message.delete(message.channel_id, message._id))
        .then(res => res.data),
  },
};

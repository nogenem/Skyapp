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
    changeStatus: 'api/user/status',
    changeThoughts: 'api/user/thoughts',
  },
  chat: {
    createChannelWith: 'api/chat/private',
    createGroupChannel: 'api/chat/group',
    updateGroupChannel: (channelId: string) => `api/chat/group/${channelId}`,
    leaveGroupChannel: (channelId: string) =>
      `api/chat/group/${channelId}/leave`,
    getMessages: (channelId: string) => `api/chat/${channelId}/messages`,
    sendMessage: (channelId: string) => `api/chat/${channelId}/messages`,
    sendFiles: (channelId: string) => `api/chat/${channelId}/files`,
    editMessage: (channelId: string, messageId: string) =>
      `api/chat/${channelId}/messages/${messageId}`,
    deleteMessage: (channelId: string, messageId: string) =>
      `api/chat/${channelId}/messages/${messageId}`,
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
        .patch(END_POINTS.user.changeStatus, { ...credentials })
        .then(res => res.data),
    changeThoughts: (credentials: IChangeThoughtsCredentials) =>
      axiosInstance
        .patch(END_POINTS.user.changeThoughts, { ...credentials })
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
    updateGroupChannel: ({
      channel_id: channelId,
      ...credentials
    }: IUpdateGroupCredentials) =>
      axiosInstance
        .patch(END_POINTS.chat.updateGroupChannel(channelId), {
          ...credentials,
        })
        .then(res => res.data),
    leaveGroupChannel: ({ channel_id: channelId }: ILeaveGroupCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.leaveGroupChannel(channelId), {})
        .then(res => res.data),
    getMessages: ({
      channel_id: channelId,
      ...credentials
    }: IFetchMessagesCredentials) =>
      axiosInstance
        .get(END_POINTS.chat.getMessages(channelId), { params: credentials })
        .then(res => res.data),
    sendMessage: ({
      channel_id: channelId,
      ...credentials
    }: ISendMessageCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.sendMessage(channelId), { ...credentials })
        .then(res => res.data),
    sendFiles: ({ channel_id: channelId, files }: ISendFilesCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.sendFiles(channelId), files)
        .then(res => res.data),
    editMessage: ({ message, ...credentials }: IEditMessageCredentials) =>
      axiosInstance
        .patch(END_POINTS.chat.editMessage(message.channel_id, message._id), {
          ...credentials,
        })
        .then(res => res.data),
    deleteMessage: ({ message }: IDeleteMessageCredentials) =>
      axiosInstance
        .delete(END_POINTS.chat.deleteMessage(message.channel_id, message._id))
        .then(res => res.data),
  },
};

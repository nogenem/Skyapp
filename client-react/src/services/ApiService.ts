import axios from 'axios';

import type {
  IEditMessageCredentials,
  IFetchMessagesCredentials,
  ILeaveGroupCredentials,
  INewGroupCredentials,
  IOtherUser,
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
    changeStatus: 'api/user/change_status',
    changeThoughts: 'api/user/change_thoughts',
  },
  chat: {
    createChannelWith: 'api/chat/private',
    createGroupChannel: 'api/chat/group',
    updateGroupChannel: 'api/chat/group',
    leaveGroupChannel: 'api/chat/group/leave',
    getMessages: 'api/chat/messages',
    sendMessage: 'api/chat/messages',
    sendFiles: 'api/chat/files',
    editMessage: 'api/chat/messages',
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
    updateGroupChannel: (credentials: IUpdateGroupCredentials) =>
      axiosInstance
        .patch(END_POINTS.chat.updateGroupChannel, { ...credentials })
        .then(res => res.data),
    leaveGroupChannel: (credentials: ILeaveGroupCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.leaveGroupChannel, { ...credentials })
        .then(res => res.data),
    getMessages: (credentials: IFetchMessagesCredentials) =>
      axiosInstance
        .get(END_POINTS.chat.getMessages, { params: credentials })
        .then(res => res.data),
    sendMessage: (credentials: ISendMessageCredentials) =>
      axiosInstance
        .post(END_POINTS.chat.sendMessage, { ...credentials })
        .then(res => res.data),
    sendFiles: (filesData: FormData) =>
      axiosInstance
        .post(END_POINTS.chat.sendFiles, filesData)
        .then(res => res.data),
    editMessage: (credentials: IEditMessageCredentials) =>
      axiosInstance
        .patch(END_POINTS.chat.editMessage, {
          message_id: credentials.message._id,
          newBody: credentials.newBody,
        })
        .then(res => res.data),
  },
};

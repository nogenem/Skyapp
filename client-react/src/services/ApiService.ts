import axios from 'axios';

import type {
  IConfirmationRequestBody,
  IForgotPasswordRequestBody,
  IResendConfirmationRequestBody,
  IResetPasswordRequestBody,
  ISignInRequestBody,
  ISignUpRequestBody,
  IValidateTokenRequestBody,
} from '~/requestsParts/auth';
import type {
  ILeaveGroupChannelRequestParams,
  IStoreGroupChannelRequestBody,
  IStorePrivateChannelRequestBody,
  IUpdateGroupChannelRequest,
  IUpdateGroupChannelRequestBody,
  IUpdateGroupChannelRequestParams,
} from '~/requestsParts/channel';
import type {
  IDeleteMessageRequestParams,
  IFetchMessagesRequest,
  IFetchMessagesRequestParams,
  IFetchMessagesRequestQuery,
  IStoreFilesRequest,
  IStoreFilesRequestBody,
  IStoreFilesRequestParams,
  IStoreMessageRequest,
  IStoreMessageRequestBody,
  IStoreMessageRequestParams,
  IUpdateMessageBodyRequest,
  IUpdateMessageBodyRequestBody,
  IUpdateMessageBodyRequestParams,
} from '~/requestsParts/message';
import type {
  IChangeStatusRequestBody,
  IChangeThoughtsRequestBody,
} from '~/requestsParts/user';

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
      update: ({ channelId }: IUpdateGroupChannelRequestParams) =>
        `api/channel/group/${channelId}`,
      leave: ({ channelId }: ILeaveGroupChannelRequestParams) =>
        `api/channel/group/${channelId}/leave`,
    },
  },
  message: {
    all: ({ channelId }: IFetchMessagesRequestParams) =>
      `api/channel/${channelId}/messages`,
    storeMessage: ({ channelId }: IStoreMessageRequestParams) =>
      `api/channel/${channelId}/messages`,
    storeFiles: ({ channelId }: IStoreFilesRequestParams) =>
      `api/channel/${channelId}/files`,
    updateBody: ({ message }: IUpdateMessageBodyRequestParams) =>
      `api/channel/${message.channelId}/messages/${message._id}`,
    delete: ({ message }: IDeleteMessageRequestParams) =>
      `api/channel/${message.channelId}/messages/${message._id}`,
  },
};

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
  withCredentials: true,
});

export default {
  auth: {
    signUp: (requestBody: ISignUpRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.signUp, { ...requestBody })
        .then(res => res.data),
    signIn: (requestBody: ISignInRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.signIn, { ...requestBody })
        .then(res => res.data),
    confirmation: (requestBody: IConfirmationRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.confirmation, { ...requestBody })
        .then(res => res.data),
    resendConfirmationEmail: (requestBody: IResendConfirmationRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.resendConfirmationEmail, { ...requestBody })
        .then(res => res.data),
    validateToken: (requestBody: IValidateTokenRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.validateToken, { ...requestBody })
        .then(res => res.data),
    forgotPassword: (requestBody: IForgotPasswordRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.forgotPassword, { ...requestBody })
        .then(res => res.data),
    resetPassword: (requestBody: IResetPasswordRequestBody) =>
      axiosInstance
        .post(END_POINTS.auth.resetPassword, { ...requestBody })
        .then(res => res.data),
  },
  user: {
    updateStatus: (requestBody: IChangeStatusRequestBody) =>
      axiosInstance
        .patch(END_POINTS.user.updateStatus, { ...requestBody })
        .then(res => res.data),
    updateThoughts: (requestBody: IChangeThoughtsRequestBody) =>
      axiosInstance
        .patch(END_POINTS.user.updateThoughts, { ...requestBody })
        .then(res => res.data),
  },
  channel: {
    private: {
      store: (requestBody: IStorePrivateChannelRequestBody) =>
        axiosInstance
          .post(END_POINTS.channel.private.store, { ...requestBody })
          .then(res => res.data),
    },
    group: {
      store: (requestBody: IStoreGroupChannelRequestBody) =>
        axiosInstance
          .post(END_POINTS.channel.group.store, { ...requestBody })
          .then(res => res.data),
      update: ({ channelId, ...rest }: IUpdateGroupChannelRequest) => {
        const requestParams: IUpdateGroupChannelRequestParams = { channelId };
        const requestBody: IUpdateGroupChannelRequestBody = {
          ...rest,
        };
        return axiosInstance
          .patch(END_POINTS.channel.group.update(requestParams), {
            ...requestBody,
          })
          .then(res => res.data);
      },
      leave: (requestParams: ILeaveGroupChannelRequestParams) =>
        axiosInstance
          .post(END_POINTS.channel.group.leave(requestParams), {})
          .then(res => res.data),
    },
  },
  message: {
    all: ({ channelId, ...rest }: IFetchMessagesRequest) => {
      const requestParams: IFetchMessagesRequestParams = { channelId };
      const requestQuery: IFetchMessagesRequestQuery = {
        ...rest,
      };
      return axiosInstance
        .get(END_POINTS.message.all(requestParams), {
          params: requestQuery,
        })
        .then(res => res.data);
    },
    storeMessage: ({ channelId, ...rest }: IStoreMessageRequest) => {
      const requestParams: IStoreMessageRequestParams = { channelId };
      const requestBody: IStoreMessageRequestBody = {
        ...rest,
      };
      return axiosInstance
        .post(END_POINTS.message.storeMessage(requestParams), {
          ...requestBody,
        })
        .then(res => res.data);
    },
    storeFiles: ({ channelId, ...rest }: IStoreFilesRequest) => {
      const requestParams: IStoreFilesRequestParams = { channelId };
      const requestBody: IStoreFilesRequestBody = {
        ...rest,
      };
      return axiosInstance
        .post(END_POINTS.message.storeFiles(requestParams), requestBody.files)
        .then(res => res.data);
    },
    updateBody: ({ message, ...rest }: IUpdateMessageBodyRequest) => {
      const requestParams: IUpdateMessageBodyRequestParams = { message };
      const requestBody: IUpdateMessageBodyRequestBody = {
        ...rest,
      };
      return axiosInstance
        .patch(END_POINTS.message.updateBody(requestParams), {
          ...requestBody,
        })
        .then(res => res.data);
    },
    delete: (requestParams: IDeleteMessageRequestParams) =>
      axiosInstance
        .delete(END_POINTS.message.delete(requestParams))
        .then(res => res.data),
  },
};

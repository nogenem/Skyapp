import MockAdapter from 'axios-mock-adapter';

import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
import type { IOtherUser } from '~/redux/chat/types';
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
import factories from '~/utils/factories';
import FACTORIES from '~/utils/factories';

import ApiService, { axiosInstance, END_POINTS } from '../ApiService';

const VALID_TOKEN = '123456789';

describe('ApiService', () => {
  const adapter = new MockAdapter(axiosInstance);

  beforeEach(() => {
    adapter.reset();
  });

  describe('.auth', () => {
    it('.signUp', async () => {
      expect.assertions(2);

      const requestBody: ISignUpRequestBody = {
        nickname: 'test',
        email: 'test@test.com',
        password: '123456',
        passwordConfirmation: '123456',
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signUp).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.signUp(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.signIn', async () => {
      expect.assertions(2);

      const requestBody: ISignInRequestBody = {
        email: 'test@test.com',
        password: '123456789',
        rememberMe: false,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signIn).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.signIn(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.confirmation', async () => {
      expect.assertions(2);

      const requestBody: IConfirmationRequestBody = {
        token: VALID_TOKEN,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.confirmation).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.confirmation(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.resendConfirmationEmail', async () => {
      expect.assertions(2);

      const requestBody: IResendConfirmationRequestBody = {
        token: VALID_TOKEN,
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.auth.resendConfirmationEmail).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.resendConfirmationEmail(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.validateToken', async () => {
      expect.assertions(2);

      const request: IValidateTokenRequestBody = {
        token: VALID_TOKEN,
      };
      const expectedRet = { decodedData: {} };
      adapter.onPost(END_POINTS.auth.validateToken).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(request)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.validateToken(request);
      expect(ret).toEqual(expectedRet);
    });

    it('.forgotPassword', async () => {
      expect.assertions(2);

      const requestBody: IForgotPasswordRequestBody = {
        email: 'test@test.com',
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.auth.forgotPassword).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.forgotPassword(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.resetPassword', async () => {
      expect.assertions(2);

      const requestBody: IResetPasswordRequestBody = {
        newPassword: '123456',
        newPasswordConfirmation: '123456',
        token: VALID_TOKEN,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.resetPassword).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.resetPassword(requestBody);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.user', () => {
    it('.updateStatus', async () => {
      expect.assertions(2);

      const requestBody: IChangeStatusRequestBody = {
        newStatus: USER_STATUS.AWAY,
      };
      const expectedRet = { message: 'success' };
      adapter.onPatch(END_POINTS.user.updateStatus).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.user.updateStatus(requestBody);
      expect(ret).toEqual(expectedRet);
    });

    it('.updateThoughts', async () => {
      expect.assertions(2);

      const requestBody: IChangeThoughtsRequestBody = {
        newThoughts: 'hello world',
      };
      const expectedRet = { message: 'success' };
      adapter.onPatch(END_POINTS.user.updateThoughts).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(requestBody)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.user.updateThoughts(requestBody);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.channel', () => {
    describe('.private', () => {
      it('.store', async () => {
        expect.assertions(2);

        const otherUser: IOtherUser = FACTORIES.models.otherUser();
        const requestBody: IStorePrivateChannelRequestBody = {
          otherUserId: otherUser._id,
        };

        const expectedRet = { message: 'success' };
        adapter.onPost(END_POINTS.channel.private.store).reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify(requestBody)).toBe(configs.data);
          return [200, expectedRet];
        });

        const ret = await ApiService.channel.private.store(requestBody);
        expect(ret).toEqual(expectedRet);
      });
    });

    describe('.group', () => {
      it('.store', async () => {
        expect.assertions(2);

        const requestBody: IStoreGroupChannelRequestBody = {
          name: 'Group 1',
          members: [],
          admins: [],
        };
        const expectedRet = { message: 'success' };
        adapter.onPost(END_POINTS.channel.group.store).reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify(requestBody)).toBe(configs.data);
          return [200, expectedRet];
        });

        const ret = await ApiService.channel.group.store(requestBody);
        expect(ret).toEqual(expectedRet);
      });

      it('.update', async () => {
        expect.assertions(2);

        const requestParams: IUpdateGroupChannelRequestParams = {
          channelId: 'some-channel-id',
        };
        const requestBody: IUpdateGroupChannelRequestBody = {
          name: 'Group 1',
          members: [],
          admins: [],
        };
        const request: IUpdateGroupChannelRequest = {
          ...requestParams,
          ...requestBody,
        };

        const expectedRet = { message: 'success' };
        adapter
          .onPatch(END_POINTS.channel.group.update(requestParams))
          .reply(configs => {
            // axios-mock-adapter uses stringify on the data ;/
            expect(JSON.stringify(requestBody)).toBe(configs.data);
            return [200, expectedRet];
          });

        const ret = await ApiService.channel.group.update(request);
        expect(ret).toEqual(expectedRet);
      });

      it('.leave', async () => {
        const requestParams: ILeaveGroupChannelRequestParams = {
          channelId: 'some-channel-id',
        };
        const expectedRet = { message: 'success' };
        adapter
          .onPost(END_POINTS.channel.group.leave(requestParams))
          .reply(configs => {
            return [200, expectedRet];
          });

        const ret = await ApiService.channel.group.leave(requestParams);
        expect(ret).toEqual(expectedRet);
      });
    });
  });

  describe('.message', () => {
    it('.all', async () => {
      expect.assertions(2);

      const requestParams: IFetchMessagesRequestParams = {
        channelId: 'some-channel-id',
      };
      const requestQuery: IFetchMessagesRequestQuery = {
        offset: 0,
      };
      const request: IFetchMessagesRequest = {
        ...requestParams,
        ...requestQuery,
      };

      const expectedRet = { message: 'success' };
      adapter.onGet(END_POINTS.message.all(requestParams)).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(requestQuery).toEqual(configs.params);
        return [200, expectedRet];
      });

      const ret = await ApiService.message.all(request);
      expect(ret).toEqual(expectedRet);
    });

    it('.storeMessage', async () => {
      expect.assertions(2);

      const requestParams: IStoreMessageRequestParams = {
        channelId: 'some-channel-id',
      };
      const requestBody: IStoreMessageRequestBody = {
        body: 'Some message',
      };
      const request: IStoreMessageRequest = {
        ...requestParams,
        ...requestBody,
      };

      const expectedRet = { message: 'success' };
      adapter
        .onPost(END_POINTS.message.storeMessage(requestParams))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify(requestBody)).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.storeMessage(request);
      expect(ret).toEqual(expectedRet);
    });

    it('.storeFiles', async () => {
      expect.assertions(2);

      const requestParams: IStoreFilesRequestParams = {
        channelId: 'some-channel-id',
      };
      const requestBody: IStoreFilesRequestBody = {
        files: new FormData(),
      };
      const request: IStoreFilesRequest = {
        ...requestParams,
        ...requestBody,
      };

      const expectedRet = { message: 'success' };
      adapter
        .onPost(END_POINTS.message.storeFiles(requestParams))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(requestBody.files).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.storeFiles(request);
      expect(ret).toEqual(expectedRet);
    });

    it('.updateBody', async () => {
      expect.assertions(2);

      const message = factories.models.message({
        body: 'Some message',
        type: MESSAGE_TYPES.TEXT,
      });

      const requestParams: IUpdateMessageBodyRequestParams = {
        message,
      };
      const requestBody: IUpdateMessageBodyRequestBody = {
        newBody: 'Some new message',
      };
      const request: IUpdateMessageBodyRequest = {
        ...requestParams,
        ...requestBody,
      };

      const expectedRet = { message: 'success' };
      adapter
        .onPatch(END_POINTS.message.updateBody(requestParams))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify(requestBody)).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.updateBody(request);
      expect(ret).toEqual(expectedRet);
    });

    it('.delete', async () => {
      expect.assertions(1);

      const message = factories.models.message();

      const requestParams: IDeleteMessageRequestParams = {
        message,
      };

      const expectedRet = { message: 'success' };
      adapter
        .onDelete(END_POINTS.message.delete(requestParams))
        .reply(configs => {
          return [200, expectedRet];
        });

      const ret = await ApiService.message.delete(requestParams);
      expect(ret).toEqual(expectedRet);
    });
  });
});

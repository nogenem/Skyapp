import MockAdapter from 'axios-mock-adapter';

import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
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

      const credentials: ISignUpCredentials = {
        nickname: 'test',
        email: 'test@test.com',
        password: '123456',
        passwordConfirmation: '123456',
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signUp).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.signUp(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.signIn', async () => {
      expect.assertions(2);

      const signInCredentials: ISignInCredentials = {
        email: 'test@test.com',
        password: '123456789',
        rememberMe: false,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signIn).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(signInCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.signIn(signInCredentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.confirmation', async () => {
      expect.assertions(2);

      const confirmationCredentials: ITokenCredentials = {
        token: VALID_TOKEN,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.confirmation).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(confirmationCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.confirmation(confirmationCredentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.resendConfirmationEmail', async () => {
      expect.assertions(2);

      const resendEmailCredentials: ITokenCredentials = {
        token: VALID_TOKEN,
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.auth.resendConfirmationEmail).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(resendEmailCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.resendConfirmationEmail(
        resendEmailCredentials,
      );
      expect(ret).toEqual(expectedRet);
    });

    it('.validateToken', async () => {
      expect.assertions(2);

      const validateTokenCredentials: ITokenCredentials = {
        token: VALID_TOKEN,
      };
      const expectedRet = { decodedData: {} };
      adapter.onPost(END_POINTS.auth.validateToken).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(validateTokenCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.validateToken(validateTokenCredentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.forgotPassword', async () => {
      expect.assertions(2);

      const forgotPasswordCredentials: IForgotPasswordCredentials = {
        email: 'test@test.com',
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.auth.forgotPassword).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(forgotPasswordCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.forgotPassword(
        forgotPasswordCredentials,
      );
      expect(ret).toEqual(expectedRet);
    });

    it('.resetPassword', async () => {
      expect.assertions(2);

      const resetPasswordCredentials: IResetPasswordCredentials = {
        newPassword: '123456',
        newPasswordConfirmation: '123456',
        token: VALID_TOKEN,
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.resetPassword).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(resetPasswordCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.auth.resetPassword(resetPasswordCredentials);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.user', () => {
    it('.updateStatus', async () => {
      expect.assertions(2);

      const credentials: IChangeStatusCredentials = {
        newStatus: USER_STATUS.AWAY,
      };
      const expectedRet = { message: 'success' };
      adapter.onPatch(END_POINTS.user.updateStatus).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.user.updateStatus(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.updateThoughts', async () => {
      expect.assertions(2);

      const credentials: IChangeThoughtsCredentials = {
        newThoughts: 'hello world',
      };
      const expectedRet = { message: 'success' };
      adapter.onPatch(END_POINTS.user.updateThoughts).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await ApiService.user.updateThoughts(credentials);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.channel', () => {
    describe('.private', () => {
      it('.store', async () => {
        expect.assertions(2);

        const otherUser: IOtherUser = FACTORIES.models.otherUser();
        const expectedRet = { message: 'success' };
        adapter.onPost(END_POINTS.channel.private.store).reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify({ _id: otherUser._id })).toBe(configs.data);
          return [200, expectedRet];
        });

        const ret = await ApiService.channel.private.store(otherUser);
        expect(ret).toEqual(expectedRet);
      });
    });

    describe('.group', () => {
      it('.store', async () => {
        expect.assertions(2);

        const credentials: INewGroupCredentials = {
          name: 'Group 1',
          members: [],
          admins: [],
        };
        const expectedRet = { message: 'success' };
        adapter.onPost(END_POINTS.channel.group.store).reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(JSON.stringify(credentials)).toBe(configs.data);
          return [200, expectedRet];
        });

        const ret = await ApiService.channel.group.store(credentials);
        expect(ret).toEqual(expectedRet);
      });

      it('.update', async () => {
        expect.assertions(2);

        const credentials: IUpdateGroupCredentials = {
          channelId: 'some-channel-id',
          name: 'Group 1',
          members: [],
          admins: [],
        };
        const expectedRet = { message: 'success' };
        adapter
          .onPatch(END_POINTS.channel.group.update(credentials.channelId))
          .reply(configs => {
            // axios-mock-adapter uses stringify on the data ;/
            const { channelId, ...data } = credentials;
            expect(JSON.stringify(data)).toBe(configs.data);
            return [200, expectedRet];
          });

        const ret = await ApiService.channel.group.update(credentials);
        expect(ret).toEqual(expectedRet);
      });

      it('.leave', async () => {
        const credentials: ILeaveGroupCredentials = {
          channelId: 'some-channel-id',
        };
        const expectedRet = { message: 'success' };
        adapter
          .onPost(END_POINTS.channel.group.leave(credentials.channelId))
          .reply(configs => {
            return [200, expectedRet];
          });

        const ret = await ApiService.channel.group.leave(credentials);
        expect(ret).toEqual(expectedRet);
      });
    });
  });

  describe('.message', () => {
    it('.all', async () => {
      expect.assertions(2);

      const credentials: IFetchMessagesCredentials = {
        channelId: 'some-channel-id',
        offset: 0,
      };
      const expectedRet = { message: 'success' };
      adapter
        .onGet(END_POINTS.message.all(credentials.channelId))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          const { channelId, ...data } = credentials;
          expect(data).toEqual(configs.params);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.all(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.storeMessage', async () => {
      expect.assertions(2);

      const credentials: ISendMessageCredentials = {
        channelId: 'some-channel-id',
        body: 'Some message',
      };
      const expectedRet = { message: 'success' };
      adapter
        .onPost(END_POINTS.message.storeMessage(credentials.channelId))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          const { channelId, ...data } = credentials;
          expect(JSON.stringify(data)).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.storeMessage(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.storeFiles', async () => {
      expect.assertions(2);

      const credentials: ISendFilesCredentials = {
        channelId: 'some-channel-id',
        files: new FormData(),
      };
      const expectedRet = { message: 'success' };
      adapter
        .onPost(END_POINTS.message.storeFiles(credentials.channelId))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          expect(credentials.files).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.storeFiles(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.updateBody', async () => {
      expect.assertions(2);

      const message = factories.models.message({
        body: 'Some message',
        type: MESSAGE_TYPES.TEXT,
      });
      const credentials: IEditMessageCredentials = {
        message,
        newBody: 'Some new message',
      };
      const expectedRet = { message: 'success' };
      adapter
        .onPatch(END_POINTS.message.updateBody(message.channelId, message._id))
        .reply(configs => {
          // axios-mock-adapter uses stringify on the data ;/
          const { message, ...data } = credentials;
          expect(JSON.stringify(data)).toBe(configs.data);
          return [200, expectedRet];
        });

      const ret = await ApiService.message.updateBody(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.delete', async () => {
      expect.assertions(1);

      const message = factories.models.message();
      const credentials: IDeleteMessageCredentials = {
        message,
      };
      const expectedRet = { message: 'success' };
      adapter
        .onDelete(END_POINTS.message.delete(message.channelId, message._id))
        .reply(configs => {
          return [200, expectedRet];
        });

      const ret = await ApiService.message.delete(credentials);
      expect(ret).toEqual(expectedRet);
    });
  });
});

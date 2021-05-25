import MockAdapter from 'axios-mock-adapter';

import { USER_STATUS } from '~/constants/user_status';
import type { IOtherUser } from '~/redux/chat/types';
import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IChangeThoughtsCredentials,
} from '~/redux/user/types';

import api, { axiosInstance, END_POINTS } from '../api';

const VALID_TOKEN = '123456789';

describe('api', () => {
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

      const ret = await api.auth.signUp(credentials);
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

      const ret = await api.auth.signIn(signInCredentials);
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

      const ret = await api.auth.confirmation(confirmationCredentials);
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

      const ret = await api.auth.resendConfirmationEmail(
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

      const ret = await api.auth.validateToken(validateTokenCredentials);
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

      const ret = await api.auth.forgotPassword(forgotPasswordCredentials);
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

      const ret = await api.auth.resetPassword(resetPasswordCredentials);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.user', () => {
    it('.changeStatus', async () => {
      expect.assertions(2);

      const credentials: IChangeStatusCredentials = {
        newStatus: USER_STATUS.AWAY,
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.user.changeStatus).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await api.user.changeStatus(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.changeThoughts', async () => {
      expect.assertions(2);

      const credentials: IChangeThoughtsCredentials = {
        newThoughts: 'hello world',
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.user.changeThoughts).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await api.user.changeThoughts(credentials);
      expect(ret).toEqual(expectedRet);
    });
  });

  describe('.chat', () => {
    it('.createChannelWith', async () => {
      expect.assertions(2);

      const otherUser: IOtherUser = {
        _id: '123456',
        nickname: 'Test',
        thoughts: '',
        status: USER_STATUS.ACTIVE,
        online: true,
      };
      const expectedRet = { message: 'success' };
      adapter.onPost(END_POINTS.chat.createChannelWith).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify({ _id: otherUser._id })).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await api.chat.createChannelWith(otherUser);
      expect(ret).toEqual(expectedRet);
    });
  });
});

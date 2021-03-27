import MockAdapter from 'axios-mock-adapter';

import type {
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
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
  });
});

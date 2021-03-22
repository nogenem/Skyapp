import MockAdapter from 'axios-mock-adapter';

import type {
  ISignUpCredentials,
  ISignInCredentials,
} from '~/redux/user/types';

import api, { axiosInstance, END_POINTS } from '../api';

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
  });
});

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
    it('.signup', async () => {
      expect.assertions(2);

      const credentials: ISignUpCredentials = {
        nickname: 'test',
        email: 'test@test.com',
        password: '123456',
        passwordConfirmation: '123456',
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signup).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(credentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await api.auth.signup(credentials);
      expect(ret).toEqual(expectedRet);
    });

    it('.signin', async () => {
      expect.assertions(2);

      const signinCredentials: ISignInCredentials = {
        email: 'test@test.com',
        password: '123456789',
      };
      const expectedRet = { user: {} };
      adapter.onPost(END_POINTS.auth.signin).reply(configs => {
        // axios-mock-adapter uses stringify on the data ;/
        expect(JSON.stringify(signinCredentials)).toBe(configs.data);
        return [200, expectedRet];
      });

      const ret = await api.auth.signin(signinCredentials);
      expect(ret).toEqual(expectedRet);
    });
  });
});

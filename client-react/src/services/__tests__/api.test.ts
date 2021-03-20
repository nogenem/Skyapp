import MockAdapter from 'axios-mock-adapter';

import type { ICredentials } from '~/redux/user/types';

import api, { axiosInstance, END_POINTS } from '../api';

describe('api', () => {
  const adapter = new MockAdapter(axiosInstance);

  beforeEach(() => {
    adapter.reset();
  });

  describe('.auth', () => {
    it('.signup', async () => {
      expect.assertions(2);

      const credentials: ICredentials = {
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
  });
});

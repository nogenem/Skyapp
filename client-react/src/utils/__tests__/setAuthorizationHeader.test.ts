import { axiosInstance } from '~/services/api';

import setAuthorizationHeader from '../setAuthorizationHeader';

const VALID_TOKEN = '123456789';

describe('setAuthorizationHeader', () => {
  afterEach(() => {
    // Reset the token
    setAuthorizationHeader();
  });

  it('sets header when passed a token', () => {
    setAuthorizationHeader(VALID_TOKEN);
    expect(axiosInstance.defaults.headers.common.authorization).toBe(
      `Bearer ${VALID_TOKEN}`,
    );
  });

  it('removes header when a token is not passed', () => {
    setAuthorizationHeader(VALID_TOKEN);
    setAuthorizationHeader();
    expect(axiosInstance.defaults.headers.common.authorization).toBeFalsy();
  });
});

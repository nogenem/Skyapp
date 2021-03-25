import supertest from 'supertest';

import app from '~/app';
import type { ITokenCredentials } from '~/controllers';

import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  verify: (token: string) => {
    /* VALID_TOKEN */
    if (token === '123456789') return {};
    throw new Error();
  },
}));

describe('Validate_Token', () => {
  setupDB();

  it('should be able to validate with a valid token', async () => {
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(200);

    expect(res.body.decodedData).toBeTruthy();
  });

  it('should not be able to validate with a valid token', async () => {
    const credentials: ITokenCredentials = {
      token: INVALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(400);
  });
});

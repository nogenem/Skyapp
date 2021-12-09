import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import type { ITokenCredentials } from '~/controllers';
import { IUserDoc } from '~/models';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';

describe('Validate_Token', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to validate with a valid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(200);

    expect(res.body.user).toBeTruthy();
  });

  it('should not be able to validate with a valid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: ITokenCredentials = {
      token: INVALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(400);
  });
});

import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import type { ITokenCredentials } from '~/controllers';
import { IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken');

const mockedJsonwebtoken = jsonwebtoken as jest.Mocked<typeof jsonwebtoken>;

describe('Validate_Token', () => {
  setupDB();

  it('should be able to validate with a valid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };

    mockedJsonwebtoken.verify.mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(200);

    expect(res.body.user).toBeTruthy();
  });

  it('should not be able to validate with a valid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const credentials: ITokenCredentials = {
      token: INVALID_TOKEN,
    };

    mockedJsonwebtoken.verify.mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/auth/validate_token')
      .send(credentials);
    expect(res.status).toBe(400);
  });
});

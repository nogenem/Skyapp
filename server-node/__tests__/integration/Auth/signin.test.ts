import { Secret, SignOptions } from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import type { ISignInCredentials } from '~/controllers';
import type { IUserDoc } from '~/models';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const TOKEN_WITH_EXPIRES_IN = '123456789';
const TOKEN_WITHOUT_EXPIRES_IN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  sign: (
    data: string | Buffer | Record<string, unknown>,
    secret: Secret,
    opts: SignOptions,
  ) => {
    if (opts && !!opts.expiresIn)
      return '123456789'; /* TOKEN_WITH_EXPIRES_IN */
    return '123456789_'; /* TOKEN_WITHOUT_EXPIRES_IN */
  },
}));

const VALID_PASSWORD = '123456';
const INVALID_PASSWORD = '123456_';
jest.mock('bcryptjs', () => ({
  hashSync: (password: string) => password,
  compareSync: (password: string) => password === '123456' /* VALID_PASSWORD */,
}));

describe('Signin', () => {
  setupDB();

  it('should be able to sign in', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>(
      'User',
      {},
      { password: VALID_PASSWORD },
    );
    const credentials: ISignInCredentials = {
      email: user.email,
      password: user.password as string,
      rememberMe: false,
    };

    const res = await request.post('/api/auth/signin').send(credentials);
    expect(res.status).toBe(200);

    expect(res.body.user).toBeTruthy();
    expect(res.body.user.token).toBe(TOKEN_WITH_EXPIRES_IN);
  });

  it('should not be able to sign in with invalid email', async () => {
    const credentials: ISignInCredentials = {
      email: 'test@test.com',
      password: VALID_PASSWORD,
      rememberMe: false,
    };

    const res = await request.post('/api/auth/signin').send(credentials);
    expect(res.status).toBe(400);
  });

  it('should not be able to sign in with invalid password', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>(
      'User',
      {},
      { password: VALID_PASSWORD },
    );
    const credentials: ISignInCredentials = {
      email: user.email,
      password: INVALID_PASSWORD,
      rememberMe: false,
    };

    const res = await request.post('/api/auth/signin').send(credentials);
    expect(res.status).toBe(400);
  });

  it("should be able to sign in with `rememberMe = true` and return a token that doesn't expires", async () => {
    const user: IUserDoc = await factory.create<IUserDoc>(
      'User',
      {},
      { password: VALID_PASSWORD },
    );
    const credentials: ISignInCredentials = {
      email: user.email,
      password: user.password as string,
      rememberMe: true,
    };

    const res = await request.post('/api/auth/signin').send(credentials);
    expect(res.status).toBe(200);

    expect(res.body.user).toBeTruthy();
    expect(res.body.user.token).toBe(TOKEN_WITHOUT_EXPIRES_IN);
  });
});

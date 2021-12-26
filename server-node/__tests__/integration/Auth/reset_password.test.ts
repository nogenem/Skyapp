import supertest from 'supertest';

import app from '~/app';
import { User } from '~/models';
import type { IUserDoc } from '~/models';
import type { IResetPasswordRequestBody } from '~/requestsParts/auth';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const OLD_PASSWORD = 'test123';
const NEW_PASSWORD = '123456';
const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  sign: () => '123456789' /* VALID_TOKEN */,
  verify: (token: string) => {
    /* VALID_TOKEN */
    if (token === '123456789') return {};
    throw new Error();
  },
}));
jest.mock('bcryptjs', () => ({
  hashSync: (password: string) => password,
}));

describe('Reset_Password', () => {
  setupDB();

  it('should be able to change password', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      passwordHash: OLD_PASSWORD,
      resetPasswordToken: VALID_TOKEN,
    });
    const requestBody: IResetPasswordRequestBody = {
      newPassword: NEW_PASSWORD,
      newPasswordConfirmation: NEW_PASSWORD,
      token: VALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/reset_password')
      .send(requestBody);
    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord.resetPasswordToken).toBe('');
    expect(userRecord.passwordHash).toBe(NEW_PASSWORD);
  });

  it('should not be able to change password with an invalid token', async () => {
    await factory.create<IUserDoc>('User', {
      passwordHash: OLD_PASSWORD,
      resetPasswordToken: VALID_TOKEN,
    });
    const requestBody: IResetPasswordRequestBody = {
      newPassword: NEW_PASSWORD,
      newPasswordConfirmation: NEW_PASSWORD,
      token: INVALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/reset_password')
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to change password with an expired token', async () => {
    await factory.create<IUserDoc>('User', {
      passwordHash: OLD_PASSWORD,
      resetPasswordToken: INVALID_TOKEN,
    });
    const requestBody: IResetPasswordRequestBody = {
      newPassword: NEW_PASSWORD,
      newPasswordConfirmation: NEW_PASSWORD,
      token: INVALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/reset_password')
      .send(requestBody);

    expect(res.status).toBe(400);
  });
});

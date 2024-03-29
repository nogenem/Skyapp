import supertest from 'supertest';

import app from '~/app';
import { User } from '~/models';
import type { IUserDoc } from '~/models';
import type { IForgotPasswordRequestBody } from '~/requestsParts/auth';
import { MailService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const NEW_VALID_TOKEN = '1234567890';
jest.mock('jsonwebtoken', () => ({
  sign: () => '1234567890' /* NEW_VALID_TOKEN */,
  verify: (token: string) => {
    /* VALID_TOKEN */
    if (token === '123456789') return {};
    throw new Error();
  },
}));

const VALID_EMAIL = 'test@test.com';
const INVALID_EMAIL = 'test2@test.com';

describe('Forgot_Password', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to send a reset password email', async () => {
    await factory.create<IUserDoc>('User', { email: VALID_EMAIL });

    const mailSpy = jest
      .spyOn(MailService, 'sendResetPasswordEmail')
      .mockReturnValueOnce(Promise.resolve());

    const requestBody: IForgotPasswordRequestBody = {
      email: VALID_EMAIL,
    };

    const res = await request
      .post('/api/auth/forgot_password')
      .send(requestBody);

    expect(res.status).toBe(200);

    expect(mailSpy).toHaveBeenCalled();

    const userRecord = (await User.findOne({
      resetPasswordToken: NEW_VALID_TOKEN,
    })) as IUserDoc;
    expect(userRecord).toBeTruthy();
  });

  it('should not be able to send a reset password email to an invalid email', async () => {
    await factory.create<IUserDoc>('User', { email: VALID_EMAIL });

    const requestBody: IForgotPasswordRequestBody = {
      email: INVALID_EMAIL,
    };

    const res = await request
      .post('/api/auth/forgot_password')
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to send a reset password email when already has a valid token in the database', async () => {
    await factory.create<IUserDoc>('User', {
      email: VALID_EMAIL,
      resetPasswordToken: VALID_TOKEN,
    });

    const requestBody: IForgotPasswordRequestBody = {
      email: VALID_EMAIL,
    };

    const res = await request
      .post('/api/auth/forgot_password')
      .send(requestBody);

    expect(res.status).toBe(400);
  });
});

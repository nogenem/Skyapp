import nodemailer, { Transporter } from 'nodemailer';
import supertest from 'supertest';

import app from '~/app';
import type { IForgotPasswordCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';
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
    const credentials: IForgotPasswordCredentials = {
      email: VALID_EMAIL,
    };

    const mockedReturn = {
      sendMail: jest.fn(() => Promise.resolve()),
    } as unknown as Transporter;
    jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce(mockedReturn);

    const res = await request
      .post('/api/auth/forgot_password')
      .send(credentials);

    expect(res.status).toBe(200);

    expect(mockedReturn.sendMail).toHaveBeenCalled();

    const userRecord = (await User.findOne({
      resetPasswordToken: NEW_VALID_TOKEN,
    })) as IUserDoc;
    expect(userRecord).toBeTruthy();
  });

  it('should not be able to send a reset password email to an invalid email', async () => {
    await factory.create<IUserDoc>('User', { email: VALID_EMAIL });
    const credentials: IForgotPasswordCredentials = {
      email: INVALID_EMAIL,
    };

    const mockedReturn = {
      sendMail: jest.fn(() => Promise.resolve()),
    } as unknown as Transporter;
    jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce(mockedReturn);

    const res = await request
      .post('/api/auth/forgot_password')
      .send(credentials);

    expect(res.status).toBe(400);

    expect(mockedReturn.sendMail).not.toHaveBeenCalled();
  });

  it('should not be able to send a reset password email when already has a valid token in the database', async () => {
    await factory.create<IUserDoc>('User', {
      email: VALID_EMAIL,
      resetPasswordToken: VALID_TOKEN,
    });
    const credentials: IForgotPasswordCredentials = {
      email: VALID_EMAIL,
    };

    const mockedReturn = {
      sendMail: jest.fn(() => Promise.resolve()),
    } as unknown as Transporter;
    jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce(mockedReturn);

    const res = await request
      .post('/api/auth/forgot_password')
      .send(credentials);

    expect(res.status).toBe(400);

    expect(mockedReturn.sendMail).not.toHaveBeenCalled();
  });
});

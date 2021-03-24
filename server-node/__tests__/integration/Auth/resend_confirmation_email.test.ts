import nodemailer, { Transporter } from 'nodemailer';
import supertest from 'supertest';

import app from '~/app';
import type { IConfirmationCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUser, IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const NEW_VALID_TOKEN = '1234567890';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  sign: () => '1234567890' /* NEW_VALID_TOKEN */,
}));
jest.mock('nodemailer');

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('Resend_Confirmation_Email', () => {
  setupDB();

  it('should be able to resend a confirmation email', async () => {
    await factory.create<IUser>('User', { confirmationToken: VALID_TOKEN }, {});
    const credentials: IConfirmationCredentials = {
      token: VALID_TOKEN,
    };

    const mockedReturn = ({
      sendMail: jest.fn(() => Promise.resolve()),
    } as unknown) as Transporter;
    mockedNodemailer.createTransport.mockReturnValueOnce(mockedReturn);

    const res = await request
      .post('/api/auth/resend_confirmation_email')
      .send(credentials);

    expect(res.status).toBe(200);

    expect(mockedReturn.sendMail).toHaveBeenCalled();

    const userRecord = (await User.findOne({
      confirmationToken: NEW_VALID_TOKEN,
    })) as IUserDoc;
    expect(userRecord).toBeTruthy();
  });

  it('should not be able to resend a confirmation email with wrong token', async () => {
    await factory.create<IUser>('User', { confirmationToken: VALID_TOKEN }, {});
    const credentials: IConfirmationCredentials = {
      token: INVALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/resend_confirmation_email')
      .send(credentials);

    expect(res.status).toBe(400);

    const userRecord = (await User.findOne({
      confirmationToken: NEW_VALID_TOKEN,
    })) as IUserDoc;
    expect(userRecord).toBeFalsy();
  });
});

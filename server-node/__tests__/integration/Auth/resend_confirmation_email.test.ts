import supertest from 'supertest';

import app from '~/app';
import { User } from '~/models';
import type { IUser, IUserDoc } from '~/models';
import type { IResendConfirmationRequestBody } from '~/requestsParts/auth';
import { MailService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const NEW_VALID_TOKEN = '1234567890';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  sign: () => '1234567890' /* NEW_VALID_TOKEN */,
  verify: (token: string) => {
    /* VALID_TOKEN */
    if (token === '123456789') return {};
    throw new Error();
  },
}));

describe('Resend_Confirmation_Email', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to resend a confirmation email', async () => {
    await factory.create<IUser>('User', { confirmationToken: INVALID_TOKEN });
    const requestBody: IResendConfirmationRequestBody = {
      token: INVALID_TOKEN,
    };

    const mailSpy = jest
      .spyOn(MailService, 'sendConfirmationEmail')
      .mockReturnValueOnce(Promise.resolve());

    const res = await request
      .post('/api/auth/resend_confirmation_email')
      .send(requestBody);

    expect(res.status).toBe(200);

    expect(mailSpy).toHaveBeenCalled();

    const userRecord = (await User.findOne({
      confirmationToken: NEW_VALID_TOKEN,
    })) as IUserDoc;
    expect(userRecord).toBeTruthy();
  });

  it('should not be able to resend a confirmation email with wrong token', async () => {
    await factory.create<IUser>('User', { confirmationToken: INVALID_TOKEN });
    const requestBody: IResendConfirmationRequestBody = {
      token: VALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/resend_confirmation_email')
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to resend a confirmation email when already has a valid token in the database', async () => {
    await factory.create<IUser>('User', { confirmationToken: VALID_TOKEN });
    const requestBody: IResendConfirmationRequestBody = {
      token: VALID_TOKEN,
    };

    const res = await request
      .post('/api/auth/resend_confirmation_email')
      .send(requestBody);

    expect(res.status).toBe(400);
  });
});

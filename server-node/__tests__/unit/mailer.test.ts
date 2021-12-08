import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

import type { IUserDoc } from '~/models';
import { MailService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const VALID_TOKEN = '123456789';

describe('mailer', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to `sendConfirmationEmail`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
    });
    const host = 'http://test.com';

    const mockedReturn = {
      sendMail: jest.fn(),
    } as unknown as Transporter;
    jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce(mockedReturn);

    const spyGenerateConfirmationUrl = jest.spyOn(
      user,
      'generateConfirmationUrl',
    );

    MailService.sendConfirmationEmail(user, host);

    expect(spyGenerateConfirmationUrl).toHaveBeenCalled();
    expect(mockedReturn.sendMail).toHaveBeenCalled();

    const email = (mockedReturn.sendMail as jest.Mock).mock
      .calls[0][0] as unknown as SendMailOptions;
    expect(email.from).toBeTruthy();
    expect(email.to).toBeTruthy();
    expect(email.subject).toBeTruthy();
    expect(email.html).toBeTruthy();
    expect(email.html).toContain(VALID_TOKEN);
  });

  it('should be able to `sendResetPasswordEmail`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      resetPasswordToken: VALID_TOKEN,
    });
    const host = 'http://test.com';

    const mockedReturn = {
      sendMail: jest.fn(),
    } as unknown as Transporter;
    jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce(mockedReturn);

    const spyGenerateResetPasswordUrl = jest.spyOn(
      user,
      'generateResetPasswordUrl',
    );

    MailService.sendResetPasswordEmail(user, host);

    expect(spyGenerateResetPasswordUrl).toHaveBeenCalled();
    expect(mockedReturn.sendMail).toHaveBeenCalled();

    const email = (mockedReturn.sendMail as jest.Mock).mock
      .calls[0][0] as unknown as SendMailOptions;
    expect(email.from).toBeTruthy();
    expect(email.to).toBeTruthy();
    expect(email.subject).toBeTruthy();
    expect(email.html).toBeTruthy();
    expect(email.html).toContain(VALID_TOKEN);
  });
});

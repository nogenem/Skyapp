import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

import type { IUserDoc } from '~/models';
import { MailService } from '~/services';

import factory from '../factories';
import { setupDB } from '../test-setup';

jest.mock('nodemailer');

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

const VALID_TOKEN = '123456789';

describe('mailer', () => {
  setupDB();

  it('should be able to `sendConfirmationEmail`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
    });
    const host = 'http://test.com';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockFn: jest.Mock<Promise<void>, any> = jest.fn(() =>
      Promise.resolve(),
    );
    const mockedReturn = {
      sendMail: mockFn,
    } as unknown as Transporter;
    mockedNodemailer.createTransport.mockReturnValueOnce(mockedReturn);

    const spyGenerateConfirmationUrl = jest.spyOn(
      user,
      'generateConfirmationUrl',
    );

    MailService.sendConfirmationEmail(user, host);

    expect(spyGenerateConfirmationUrl).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalled();

    const email = mockFn.mock.calls[0][0] as unknown as SendMailOptions;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockFn: jest.Mock<Promise<void>, any> = jest.fn(() =>
      Promise.resolve(),
    );
    const mockedReturn = {
      sendMail: mockFn,
    } as unknown as Transporter;
    mockedNodemailer.createTransport.mockReturnValueOnce(mockedReturn);

    const spyGenerateResetPasswordUrl = jest.spyOn(
      user,
      'generateResetPasswordUrl',
    );

    MailService.sendResetPasswordEmail(user, host);

    expect(spyGenerateResetPasswordUrl).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalled();

    const email = mockFn.mock.calls[0][0] as unknown as SendMailOptions;
    expect(email.from).toBeTruthy();
    expect(email.to).toBeTruthy();
    expect(email.subject).toBeTruthy();
    expect(email.html).toBeTruthy();
    expect(email.html).toContain(VALID_TOKEN);
  });
});

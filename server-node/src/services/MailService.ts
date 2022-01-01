import nodemailer, { SentMessageInfo } from 'nodemailer';
import Mail, { Address } from 'nodemailer/lib/mailer';

import i18n from '~/i18n';

import type { IUserDoc } from '../models';

class MailService {
  private static FROM: Address = {
    name: 'Skyapp',
    address: process.env.EMAIL_USER,
  };

  private static setup() {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    // https://mailtrap.io
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  static async sendConfirmationEmail(
    user: IUserDoc,
    host: string,
  ): Promise<SentMessageInfo> {
    const tranport = MailService.setup();
    const url = user.generateConfirmationUrl(host);
    const email: Mail.Options = {
      from: MailService.FROM,
      to: {
        name: user.nickname,
        address: user.email,
      },
      subject: i18n.t('Emails:Welcome to Skyapp'),
      html: `
      <h2>${i18n.t('Emails:Welcome to Skyapp')}</h2>
      <p>
        ${i18n.t(
          'Emails:Please, confirm your email by clicking the link below.',
        )}<br/>
        <a href="${url}" target="_blank">${url}</a>
      </p>
      `,
    };

    return tranport.sendMail(email);
  }

  static async sendResetPasswordEmail(
    user: IUserDoc,
    host: string,
  ): Promise<SentMessageInfo> {
    const tranport = MailService.setup();
    const url = user.generateResetPasswordUrl(host);
    const email: Mail.Options = {
      from: MailService.FROM,
      to: {
        name: user.nickname,
        address: user.email,
      },
      subject: i18n.t('Emails:Reset password'),
      html: `
      <h2>Skyapp</h2>
      <p>
        ${i18n.t(
          'Emails:To reset your password, please click on the link below.',
        )}</br>
        <a href="${url}" target="_blank">${url}</a>
      </p>
      `,
    };

    return tranport.sendMail(email);
  }
}

export default MailService;

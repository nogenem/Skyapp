import nodemailer, { SentMessageInfo } from 'nodemailer';

import type { IUserDoc } from '../models';

class MailService {
  private static FROM = `${process.env.EMAIL_USER} <${process.env.EMAIL_USER}>`;

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
    const email = {
      from: MailService.FROM,
      to: `${user.email} <${user.email}>`,
      subject: 'Welcome to Skyapp',
      html: `
      <h2>Welcome to Skyapp.</h2>
      <p>
        Please, confirm your email by clicking the link below.<br/>
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
    const email = {
      from: MailService.FROM,
      to: `${user.email} <${user.email}>`,
      subject: 'Reset Password',
      html: `
      <h2>Skyapp</h2>
      <p>
        To reset your password, please click on the link below.</br>
        <a href="${url}" target="_blank">${url}</a>
      </p>
      `,
    };

    return tranport.sendMail(email);
  }
}

export default MailService;

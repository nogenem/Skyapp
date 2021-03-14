import nodemailer, { Transporter } from 'nodemailer';
import supertest from 'supertest';

import app from '~/app';
import { User } from '~/models';
import type { IUser, IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const DEFAULT_TOKEN = '123456789';
jest.mock('jsonwebtoken', () => ({
  sign: () => '123456789' /* DEFAULT_TOKEN */,
}));
jest.mock('bcryptjs', () => ({
  hashSync: (password: string) => password,
}));
jest.mock('nodemailer');

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('Signup', () => {
  setupDB();

  it('should be able to signup and should send a confirmation email', async () => {
    const user: IUser = await factory.attrs('User', {}, { password: '123456' });

    const mockedReturn = ({
      sendMail: jest.fn(() => Promise.resolve()),
    } as unknown) as Transporter;
    mockedNodemailer.createTransport.mockReturnValueOnce(mockedReturn);

    const res = await request.post('/api/auth/signup').send({ ...user });

    expect(res.status).toBe(201);

    expect(mockedReturn.sendMail).toHaveBeenCalled();

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord).toBeTruthy();
    expect(userRecord.nickname).toBe(user.nickname);
    expect(userRecord.confirmationToken).toBe(DEFAULT_TOKEN);
  });

  it('should not be able to signup with missing credentials', async () => {
    const user: IUser = await factory.attrs<IUser>('User', { password: '' });

    const res = await request.post('/api/auth/signup').send({ ...user });
    expect(res.status).toBe(400);

    const userRecord = await User.findOne({ email: user.email });
    expect(userRecord).toBeFalsy();
  });

  it('should not be able to signup with an already existing email', async () => {
    const user1: IUser = await factory.create<IUser>('User', {
      email: 'test@test.com',
    });
    const user: IUser = await factory.attrs<IUser>('User', {
      email: 'test@test.com',
    });

    const res = await request.post('/api/auth/signup').send({ ...user });
    expect(res.status).toBe(400);

    const userRecord = await User.find({ email: user1.email });
    expect(userRecord.length).toBe(1);
  });
});

import supertest from 'supertest';

import app from '~/app';
import type { ISignUpCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUser, IUserDoc } from '~/models';
import { MailService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const DEFAULT_TOKEN = '123456789';
jest.mock('jsonwebtoken', () => ({
  sign: () => '123456789' /* DEFAULT_TOKEN */,
}));
jest.mock('bcryptjs', () => ({
  hashSync: (password: string) => password,
}));

describe('Signup', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to sign up and should send a confirmation email', async () => {
    const user: IUser = await factory.attrs<IUser>(
      'User',
      {},
      { password: '123456' },
    );

    const mailSpy = jest
      .spyOn(MailService, 'sendConfirmationEmail')
      .mockReturnValueOnce(Promise.resolve());

    const credentials: ISignUpCredentials = {
      nickname: user.nickname,
      email: user.email,
      password: user.password as string,
      passwordConfirmation: user.passwordConfirmation as string,
    };

    const res = await request.post('/api/auth/signup').send(credentials);

    expect(res.status).toBe(201);

    expect(mailSpy).toHaveBeenCalled();

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord).toBeTruthy();
    expect(userRecord.nickname).toBe(user.nickname);
    expect(userRecord.confirmationToken).toBe(DEFAULT_TOKEN);
  });

  it('should not be able to sign up with missing credentials', async () => {
    const user: IUser = await factory.attrs<IUser>('User', { password: '' });
    const credentials: ISignUpCredentials = {
      nickname: user.nickname,
      email: user.email,
      password: user.password as string,
      passwordConfirmation: user.passwordConfirmation as string,
    };

    const res = await request.post('/api/auth/signup').send(credentials);
    expect(res.status).toBe(400);

    const userRecord = await User.findOne({ email: user.email });
    expect(userRecord).toBeFalsy();
  });

  it('should not be able to sign up with an already existing email', async () => {
    const user1: IUserDoc = await factory.create<IUserDoc>('User', {
      email: 'test@test.com',
    });
    const user: IUser = await factory.attrs<IUser>('User', {
      email: 'test@test.com',
    });
    const credentials: ISignUpCredentials = {
      nickname: user.nickname,
      email: user.email,
      password: user.password as string,
      passwordConfirmation: user.passwordConfirmation as string,
    };

    const res = await request.post('/api/auth/signup').send(credentials);
    expect(res.status).toBe(400);

    const userRecord = await User.find({ email: user1.email });
    expect(userRecord.length).toBe(1);
  });
});

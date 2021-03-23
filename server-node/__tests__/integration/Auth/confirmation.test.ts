import supertest from 'supertest';

import app from '~/app';
import type { IConfirmationCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';
jest.mock('jsonwebtoken', () => ({
  sign: () => '123456789_' /* INVALID_TOKEN */,
  verify: (token: string) => {
    /* VALID_TOKEN */
    if (token === '123456789') return {};
    throw new Error();
  },
}));

describe('Confirmation', () => {
  setupDB();

  it('should be able to confirm the sign up', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
    });
    const credentials: IConfirmationCredentials = {
      token: user.confirmationToken as string,
    };

    const res = await request.post('/api/auth/confirmation').send(credentials);
    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord.confirmationToken).toBe('');
    expect(userRecord.confirmed).toBe(true);
  });

  it('should not be able to confirm with invalid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: INVALID_TOKEN,
    });
    const credentials: IConfirmationCredentials = {
      token: user.confirmationToken as string,
    };

    const res = await request.post('/api/auth/confirmation').send(credentials);
    expect(res.status).toBe(400);

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord.confirmationToken).toBe(INVALID_TOKEN);
    expect(userRecord.confirmed).toBe(false);
  });

  it('should not be able to confirm with the same token twice', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
    });
    const credentials: IConfirmationCredentials = {
      token: user.confirmationToken as string,
    };

    const res1 = await request.post('/api/auth/confirmation').send(credentials);
    expect(res1.status).toBe(200);

    const res2 = await request.post('/api/auth/confirmation').send(credentials);
    expect(res2.status).toBe(400);
  });
});

import supertest from 'supertest';

import app from '~/app';
import { IO_NEW_USER } from '~/constants/socket_events';
import type { ITokenCredentials } from '~/controllers';
import { IChatUser, User } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to confirm the sign up', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
      confirmed: false,
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials: ITokenCredentials = {
      token: user.confirmationToken as string,
    };

    const res = await request.post('/api/auth/confirmation').send(credentials);
    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({ email: user.email })) as IUserDoc;
    expect(userRecord.confirmationToken).toBe('');
    expect(userRecord.confirmed).toBe(true);

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_NEW_USER);
    expect((ioSpy.mock.calls[0][1] as IChatUser)._id).toBe(user._id.toString());
  });

  it('should not be able to confirm with invalid token', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: INVALID_TOKEN,
      confirmed: false,
    });
    const credentials: ITokenCredentials = {
      token: user.confirmationToken as string,
    };

    const res = await request.post('/api/auth/confirmation').send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to confirm with the same token twice', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      confirmationToken: VALID_TOKEN,
      confirmed: false,
    });

    const io = IoService.instance();
    jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials: ITokenCredentials = {
      token: user.confirmationToken as string,
    };

    const res1 = await request.post('/api/auth/confirmation').send(credentials);
    expect(res1.status).toBe(200);

    const res2 = await request.post('/api/auth/confirmation').send(credentials);
    expect(res2.status).toBe(400);
  });
});

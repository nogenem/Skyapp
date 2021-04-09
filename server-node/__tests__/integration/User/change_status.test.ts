import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { USER_STATUS } from '~/constants/user_status';
import type { IChangeStatusCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';
jest.mock('jsonwebtoken');

const mockedJsonwebtoken = jsonwebtoken as jest.Mocked<typeof jsonwebtoken>;

describe('Change_Status', () => {
  setupDB();

  it('should be able to change user status', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const credentials: IChangeStatusCredentials = {
      newStatus: USER_STATUS.AWAY,
    };

    mockedJsonwebtoken.verify.mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/user/change_status')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({
      _id: user._id,
    })) as IUserDoc;
    expect(userRecord.status).toBe(USER_STATUS.AWAY);
  });

  it('should return 304 (Not Modified) if trying to change to the same status', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      status: USER_STATUS.AWAY,
    });
    const credentials: IChangeStatusCredentials = {
      newStatus: USER_STATUS.AWAY,
    };

    mockedJsonwebtoken.verify.mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/user/change_status')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(304);
  });
});

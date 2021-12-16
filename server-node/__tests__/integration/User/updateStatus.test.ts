import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_USER_STATUS_CHANGED } from '~/constants/socket_events';
import { USER_STATUS } from '~/constants/user_status';
import type { IChangeStatusCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Update_Status', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to change user status', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      status: USER_STATUS.ACTIVE,
    });
    const newStatus = USER_STATUS.AWAY;

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials: IChangeStatusCredentials = {
      newStatus,
    };

    const res = await request
      .patch('/api/user/status')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({
      _id: user._id,
    })) as IUserDoc;
    expect(userRecord.status).toBe(newStatus);

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_USER_STATUS_CHANGED);
    expect(ioSpy.mock.calls[0][1]).toEqual({
      userId: user._id,
      newStatus,
    });
  });

  it('should return 304 (Not Modified) if trying to change to the same status', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      status: USER_STATUS.AWAY,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: IChangeStatusCredentials = {
      newStatus: USER_STATUS.AWAY,
    };

    const res = await request
      .patch('/api/user/status')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(304);
  });
});

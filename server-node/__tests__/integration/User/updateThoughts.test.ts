import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_USER_THOUGHTS_CHANGED } from '~/constants/socket_events';
import type { IChangeThoughtsCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Update_Thoughts', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to change user thoughts', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      thoughts: 'Some thoughts...',
    });
    const newThoughts = 'hello world';

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials: IChangeThoughtsCredentials = {
      newThoughts,
    };

    const res = await request
      .patch('/api/user/thoughts')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({
      _id: user._id,
    })) as IUserDoc;
    expect(userRecord.thoughts).toBe(newThoughts);

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_USER_THOUGHTS_CHANGED);
    expect(ioSpy.mock.calls[0][1]).toEqual({
      user_id: user._id,
      newThoughts,
    });
  });

  it('should return 304 (Not Modified) if trying to change to the same thoughts', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      thoughts: 'hello world',
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: IChangeThoughtsCredentials = {
      newThoughts: 'hello world',
    };

    const res = await request
      .patch('/api/user/thoughts')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(304);
  });
});

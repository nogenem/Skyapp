import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import type { IChangeThoughtsCredentials } from '~/controllers';
import { User } from '~/models';
import type { IUserDoc } from '~/models';

import factory from '../../factories';
import { setupDB } from '../../test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Change_Thoughts', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to change user thoughts', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      thoughts: 'Some thoughts...',
    });
    const credentials: IChangeThoughtsCredentials = {
      newThoughts: 'hello world',
    };

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/user/change_thoughts')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const userRecord = (await User.findOne({
      _id: user._id,
    })) as IUserDoc;
    expect(userRecord.thoughts).toBe(credentials.newThoughts);
  });

  it('should return 304 (Not Modified) if trying to change to the same thoughts', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {
      thoughts: 'hello world',
    });
    const credentials: IChangeThoughtsCredentials = {
      newThoughts: 'hello world',
    };

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .post('/api/user/change_thoughts')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(304);
  });
});

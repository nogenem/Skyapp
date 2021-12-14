import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import type { IChannelDoc, IMessageDoc, IUserDoc } from '~/models';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('All', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to get the messages from a channel', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const message = await factory.create<IMessageDoc>('Message', {
      channel_id: channel._id.toString(),
    });
    const user1Id = channel.members[0].user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const res = await request
      .get(`/api/channel/${channel._id.toString()}/messages?offset=0`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(200);

    const responseMessages = res.body.docs as IMessageDoc[];
    expect(responseMessages.length).toBe(1);
    expect(responseMessages[0]._id).toBe(message._id.toString());
  });

  it('should not be able to get the messages with an invalid `channel_id`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .get(`/api/channel/some-channel-id/messages?offset=0`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('should not be able to get the messages from a channel that you are not a member of', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const channel = await factory.create<IChannelDoc>('Channel');
    await factory.create<IMessageDoc>('Message', {
      channel_id: channel._id.toString(),
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const res = await request
      .get(`/api/channel/${channel._id.toString()}/messages?offset=0`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });
});

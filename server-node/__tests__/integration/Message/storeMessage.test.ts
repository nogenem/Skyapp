import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_MESSAGES_RECEIVED } from '~/constants/socket_events';
import { ISendMessageCredentials } from '~/controllers';
import { IUserDoc, Message } from '~/models';
import type { IChannelDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Store_Message', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to send a text message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const message = 'Some message';
    const channelId = channel._id.toString();
    const credentials: ISendMessageCredentials = {
      body: message,
    };

    const res = await request
      .post(`/api/channel/${channelId}/messages`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const messageRecord = await Message.findOne({
      channel_id: channel._id.toString(),
      body: message,
    });

    expect(messageRecord).toBeTruthy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_MESSAGES_RECEIVED);
  });

  it('should not be able to send a text message with an invalid `channel_id`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const channelId = 'some-channel-id';
    const credentials: ISendMessageCredentials = {
      body: 'Some message',
    };

    const res = await request
      .post(`/api/channel/${channelId}/messages`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});

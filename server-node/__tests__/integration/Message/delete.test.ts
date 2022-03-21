import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_MESSAGE_DELETED } from '~/constants/socket_events';
import { Message } from '~/models';
import type { IChannelDoc, IMessageDoc, IUserDoc } from '~/models';
import type { IDeleteMessageRequestParams } from '~/requestsParts/message';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Delete', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to delete a message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message1 = await factory.create<IMessageDoc>('Message', {
      channelId: channel._id.toString(),
      fromId: user1Id,
    });
    const message2 = await factory.create<IMessageDoc>('Message', {
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const requestParams: IDeleteMessageRequestParams = {
      channelId: channel._id.toString(),
      messageId: message1._id.toString(),
    };

    const res = await request
      .delete(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.lastMessage._id).toBe(message2._id.toString());

    const messageRecord = await Message.findOne({
      _id: message1._id.toString(),
    });

    expect(messageRecord).toBeFalsy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_MESSAGE_DELETED);
  });

  it('should not be able to delete a message with an invalid `channelId`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const message = await factory.create<IMessageDoc>('Message');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const requestParams: IDeleteMessageRequestParams = {
      channelId: 'some-channel-id',
      messageId: message._id.toString(),
    };

    const res = await request
      .delete(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('should not be able to delete a message with an invalid `messageId`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const channel = await factory.create<IChannelDoc>('Channel');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const requestParams: IDeleteMessageRequestParams = {
      channelId: channel._id.toString(),
      messageId: 'some-message-id',
    };

    const res = await request
      .delete(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('should not be able to delete a message that is not yours', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      channelId: channel._id.toString(),
      fromId: undefined,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IDeleteMessageRequestParams = {
      channelId: channel._id.toString(),
      messageId: message._id.toString(),
    };

    const res = await request
      .delete(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('should not be able to delete a message on a channel that you are not a member of', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = 'some-user-id';
    const message = await factory.create<IMessageDoc>('Message', {
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IDeleteMessageRequestParams = {
      channelId: channel._id.toString(),
      messageId: message._id.toString(),
    };

    const res = await request
      .delete(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send();

    expect(res.status).toBe(400);
  });
});

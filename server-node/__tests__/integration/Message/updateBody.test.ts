import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { MESSAGE_TYPES } from '~/constants/message_types';
import { IO_MESSAGE_EDITED } from '~/constants/socket_events';
import { Message } from '~/models';
import type { IChannelDoc, IMessageDoc } from '~/models';
import type {
  IUpdateMessageBodyRequestBody,
  IUpdateMessageBodyRequestParams,
} from '~/requestsParts/message';
import { IoService } from '~/services';
import factory, { attachmentFactory } from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('UpdateBody', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to edit a text message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: channel._id.toString(),
      messageId: message._id.toString(),
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some new message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(200);

    const messageRecord = await Message.findOne({
      _id: requestParams.messageId,
      channelId: requestParams.channelId,
      body: requestBody.newBody,
    });

    expect(messageRecord).toBeTruthy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_MESSAGE_EDITED);
  });

  it('should not be able to edit a text message with an invalid `channelId`', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: 'some-channel-id',
      messageId: message._id.toString(),
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a text message with an invalid `messageId`', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: channel._id.toString(),
      messageId: 'some-message-id',
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a text message that is not yours', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channelId: channel._id.toString(),
      fromId: undefined,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: channel._id.toString(),
      messageId: message._id.toString(),
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a file message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].userId.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: attachmentFactory(),
      type: MESSAGE_TYPES.UPLOADED_FILE,
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: channel._id.toString(),
      messageId: message._id.toString(),
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a text message on a channel that you are not a member of', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = 'some-user-id';
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channelId: channel._id.toString(),
      fromId: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const requestParams: IUpdateMessageBodyRequestParams = {
      channelId: 'some-channel-id',
      messageId: message._id.toString(),
    };
    const requestBody: IUpdateMessageBodyRequestBody = {
      newBody: 'Some message',
    };

    const res = await request
      .patch(
        `/api/channel/${requestParams.channelId}/messages/${requestParams.messageId}`,
      )
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });
});

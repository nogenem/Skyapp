import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { MESSAGE_TYPES } from '~/constants/message_types';
import { IO_MESSAGE_EDITED } from '~/constants/socket_events';
import { IEditMessageCredentials } from '~/controllers';
import { IMessageDoc, Message } from '~/models';
import type { IChannelDoc } from '~/models';
import { IoService } from '~/services';
import factory, { attachmentFactory } from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Edit_Message', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to edit a text message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channel_id: channel._id.toString(),
      from_id: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const newBody = 'Some new message';
    const credentials: IEditMessageCredentials = {
      message_id: message._id.toString(),
      newBody,
    };

    const res = await request
      .patch('/api/chat/messages')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const messageRecord = await Message.findOne({
      channel_id: channel._id.toString(),
      body: newBody,
    });

    expect(messageRecord).toBeTruthy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_MESSAGE_EDITED);
  });

  it('should not be able to edit a text message with an invalid `message_id`', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();
    await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channel_id: channel._id.toString(),
      from_id: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const credentials: IEditMessageCredentials = {
      message_id: 'some-message-id',
      newBody: 'Some message',
    };

    const res = await request
      .patch('/api/chat/messages')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a text message that is not yours', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: 'Some message',
      type: MESSAGE_TYPES.TEXT,
      channel_id: channel._id.toString(),
      from_id: undefined,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const credentials: IEditMessageCredentials = {
      message_id: message._id.toString(),
      newBody: 'Some message',
    };

    const res = await request
      .patch('/api/chat/messages')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to edit a file message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      body: attachmentFactory(),
      type: MESSAGE_TYPES.UPLOADED_FILE,
      channel_id: channel._id.toString(),
      from_id: user1Id,
    });

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const credentials: IEditMessageCredentials = {
      message_id: message._id.toString(),
      newBody: 'Some message',
    };

    const res = await request
      .patch('/api/chat/messages')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});

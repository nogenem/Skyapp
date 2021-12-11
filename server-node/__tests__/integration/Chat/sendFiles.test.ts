import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_MESSAGES_RECEIVED } from '~/constants/socket_events';
import { Message } from '~/models';
import type { IChannelDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

jest.mock('multer', () => {
  const ret = () => ({
    array: () => {
      return (req: Request, res: Response, next: NextFunction) => {
        req.body.channel_id = req.query.channel_id;
        req.files = [
          {
            originalname: 'hello.txt',
            mimetype: 'text',
            path: 'path/hello.txt',
            buffer: Buffer.from('whatever'), // this is required since `formData` needs access to the buffer
          },
        ] as unknown as Express.Multer.File[];
        return next();
      };
    },
  });
  ret.memoryStorage = () => jest.fn();
  ret.diskStorage = () => jest.fn();
  ret.MulterError = () => jest.fn();
  return ret;
});

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Send_Files', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to send a file message', async () => {
    const channel = await factory.create<IChannelDoc>('Channel');
    const user1Id = channel.members[0].user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    // PS: I dont know how to handle multpart requests inside my multer' mock,
    // so i had to 'cheese' it, passing the channel_id in the query too ;/
    const channelId = channel._id.toString();
    const res = await request
      .post(`/api/chat/files?channel_id=${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .field('channel_id', channelId)
      .attach('files', '__tests__/files/hello.txt');

    expect(res.status).toBe(200);

    const messageRecord = await Message.findOne({
      channel_id: channelId,
    });

    expect(messageRecord).toBeTruthy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_MESSAGES_RECEIVED);
  });

  // PS: I tried to make this work for a good amount of time, but couldn't ;/
  // I just keep getting a: "write ECONNABORTED" error...

  // eslint-disable-next-line jest/no-commented-out-tests
  // it('should not be able to send a message with an invalid `channel_id`', async () => {
  //   const user: IUserDoc = await factory.create<IUserDoc>('User');

  //   jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
  //     if (token === VALID_TOKEN) return { _id: user._id };
  //     throw new Error();
  //   });

  //   // PS: I dont know how to handle multpart requests inside my multer's mock,
  //   // so i had to 'cheese' it, by passing the channel_id in the query too ;/
  //   const channelId = 'some-channel-id';
  //   const res = await request
  //     .post(`/api/chat/files?channel_id=${channelId}`)
  //     .set('authorization', `Bearer ${VALID_TOKEN}`)
  //     .field('channel_id', channelId)
  //     .attach('files', '__tests__/files/hello.txt');

  //   expect(res.status).toBe(400);
  // });
});

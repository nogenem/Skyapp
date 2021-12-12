import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_PRIVATE_CHANNEL_CREATED } from '~/constants/socket_events';
import { Channel, IChannelDoc, IChatChannel } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Create_Private_Channel', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to create a new private channel', async () => {
    const user1: IUserDoc = await factory.create<IUserDoc>('User');
    const user2: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1._id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials = {
      _id: user2._id.toString(),
    };

    const res = await request
      .post('/api/chat/private')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(201);

    const channelRecord = (await Channel.findOne({
      $and: [
        { is_group: false },
        { 'members.user_id': user1._id },
        { 'members.user_id': user2._id },
      ],
    })) as IChannelDoc;

    expect(channelRecord).toBeTruthy();

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_PRIVATE_CHANNEL_CREATED);
    expect((ioSpy.mock.calls[0][1] as IChatChannel)._id).toBe(
      channelRecord._id.toString(),
    );
  });

  it('should not be able to create a new private channel with an invalid `user_id`', async () => {
    const user1: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1._id };
      throw new Error();
    });

    const credentials = {
      _id: 'some-user-id',
    };

    const res = await request
      .post('/api/chat/private')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to create a new private channel if the users are already chatting', async () => {
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {},
      { membersLen: 2 },
    );
    const user1Id = channel.members[0].user_id.toString();
    const user2Id = channel.members[1].user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const credentials = {
      _id: user2Id,
    };

    const res = await request
      .post('/api/chat/private')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});
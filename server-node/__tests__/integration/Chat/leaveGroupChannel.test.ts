import jsonwebtoken from 'jsonwebtoken';
import { Types } from 'mongoose';
import supertest from 'supertest';

import app from '~/app';
import {
  IO_GROUP_CHANNEL_UPDATED,
  IO_MESSAGES_RECEIVED,
  IO_REMOVED_FROM_GROUP_CHANNEL,
} from '~/constants/socket_events';
import { ILeaveGroupCredentials } from '~/controllers';
import { Channel } from '~/models';
import type { IChannelDoc, IMemberDoc, IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Leave_Group_Channel', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to leave a group channel', async () => {
    const member1 = await factory.create<IMemberDoc>('Member', {
      is_adm: true,
    });
    const member2 = await factory.create<IMemberDoc>('Member', {
      is_adm: false,
    });
    const member3 = await factory.create<IMemberDoc>('Member', {
      is_adm: false,
    });

    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        members: new Types.DocumentArray([member1, member2, member3]),
        is_group: true,
      },
      { membersLen: 0 },
    );
    const user1Id = member1.user_id.toString();
    const user2Id = member2.user_id.toString();
    const user3Id = member3.user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const credentials: ILeaveGroupCredentials = {
      channel_id: channel._id.toString(),
    };

    const res = await request
      .post('/api/chat/group/leave')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const channelRecord = (await Channel.findOne({
      $and: [
        { is_group: true },
        { 'members.user_id': user2Id },
        { 'members.user_id': user3Id },
      ],
    })) as IChannelDoc;

    expect(channelRecord).toBeTruthy();
    expect(channelRecord.members.length).toBe(2);

    expect(ioSpy).toHaveBeenCalledTimes(3);
    expect(ioSpy.mock.calls[0][0]).toBe(IO_REMOVED_FROM_GROUP_CHANNEL);
    expect(ioSpy.mock.calls[1][0]).toBe(IO_GROUP_CHANNEL_UPDATED);
    expect(ioSpy.mock.calls[2][0]).toBe(IO_MESSAGES_RECEIVED);
  });

  it('should not be able to leave a group channel with an invalid `channel_id`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: ILeaveGroupCredentials = {
      channel_id: 'some-channel-id',
    };

    const res = await request
      .post('/api/chat/group/leave')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to leave a private channel', async () => {
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {},
      { membersLen: 2 },
    );
    const user1Id = channel.members[0].user_id.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const credentials: ILeaveGroupCredentials = {
      channel_id: channel._id.toString(),
    };

    const res = await request
      .post('/api/chat/group/leave')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to leave a group channel that you are not a member of', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {},
      { membersLen: 2 },
    );

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: ILeaveGroupCredentials = {
      channel_id: channel._id.toString(),
    };

    const res = await request
      .post('/api/chat/group/leave')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});

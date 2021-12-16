import jsonwebtoken from 'jsonwebtoken';
import { Types } from 'mongoose';
import supertest from 'supertest';

import app from '~/app';
import {
  IO_GROUP_CHANNEL_UPDATED,
  IO_MESSAGES_RECEIVED,
  IO_REMOVED_FROM_GROUP_CHANNEL,
} from '~/constants/socket_events';
import { IUpdateGroupCredentials } from '~/controllers';
import { Channel, IChannelDoc, IMemberDoc } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Group_Update', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to update a group channel', async () => {
    const member1 = await factory.create<IMemberDoc>('Member', {
      isAdm: true,
    });
    const member2 = await factory.create<IMemberDoc>('Member');
    const member3 = await factory.create<IMemberDoc>('Member');

    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        name: 'Group 1',
        members: new Types.DocumentArray([member1, member2, member3]),
        isGroup: true,
      },
      { membersLen: 0 },
    );
    const user1Id = member1.userId.toString();
    const user2Id = member2.userId.toString();
    const user4: IUserDoc = await factory.create<IUserDoc>('User');

    const newGroupName = 'Updated Group 1';

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const channelId = channel._id.toString();
    const credentials: IUpdateGroupCredentials = {
      name: newGroupName, // updated name
      members: [
        user2Id.toString(),
        user4._id.toString(), // updated user
      ],
      // updated admins
      admins: [user4._id.toString()],
    };

    const res = await request
      .patch(`/api/channel/group/${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(200);

    const channelRecord = (await Channel.findOne({
      $and: [
        { isGroup: true },
        { 'members.userId': user1Id },
        { 'members.userId': user2Id },
        { 'members.userId': user4._id },
      ],
    })) as IChannelDoc;

    expect(channelRecord).toBeTruthy();
    expect(channelRecord.name).toBe(newGroupName);
    expect(channelRecord.members[2].userId.toString()).toBe(
      user4._id.toString(),
    );
    expect(channelRecord.members[2].isAdm).toBe(true);

    expect(ioSpy).toHaveBeenCalledTimes(3);
    expect(ioSpy.mock.calls[0][0]).toBe(IO_REMOVED_FROM_GROUP_CHANNEL);
    expect(ioSpy.mock.calls[1][0]).toBe(IO_GROUP_CHANNEL_UPDATED);
    expect(ioSpy.mock.calls[2][0]).toBe(IO_MESSAGES_RECEIVED);
  });

  it('should not be able to update a group channel with an invalid `channelId`', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const channelId = 'some-channel-id';
    const credentials: IUpdateGroupCredentials = {
      name: 'Updated Group 1',
      members: ['some-member-id-1', 'some-member-id-2'],
      admins: [],
    };

    const res = await request
      .patch(`/api/channel/group/${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to update a private channel', async () => {
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {},
      { membersLen: 2 },
    );
    const user1Id = channel.members[0].userId.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const channelId = channel._id.toString();
    const credentials: IUpdateGroupCredentials = {
      name: 'Updated Group 1',
      members: ['some-member-id-1', 'some-member-id-2'],
      admins: [],
    };

    const res = await request
      .patch(`/api/channel/group/${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to update a group channel when the user is not an admin', async () => {
    const member1 = await factory.create<IMemberDoc>('Member', {
      isAdm: false,
    });
    const member2 = await factory.create<IMemberDoc>('Member');
    const member3 = await factory.create<IMemberDoc>('Member');

    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        name: 'Group 1',
        members: new Types.DocumentArray([member1, member2, member3]),
        isGroup: true,
      },
      { membersLen: 0 },
    );
    const user1Id = member1.userId.toString();

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1Id };
      throw new Error();
    });

    const channelId = channel._id.toString();
    const credentials: IUpdateGroupCredentials = {
      name: 'Updated Group 1',
      members: [member2.userId.toString(), member3.userId.toString()],
      admins: [],
    };

    const res = await request
      .patch(`/api/channel/group/${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it('should not be able to update a group channel with invalid memberIds', async () => {
    const member = await factory.create<IMemberDoc>('Member', {
      isAdm: true,
    });
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        name: 'Group 1',
        members: new Types.DocumentArray([member]),
        isGroup: true,
      },
      { membersLen: 0 },
    );

    const user2: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: member.userId };
      throw new Error();
    });

    const channelId = channel._id.toString();
    const credentials: IUpdateGroupCredentials = {
      name: 'Group 1',
      members: [user2._id.toString(), user2._id.toString()],
      admins: [],
    };

    const res = await request
      .patch(`/api/channel/group/${channelId}`)
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});

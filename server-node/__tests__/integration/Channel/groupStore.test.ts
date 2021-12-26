import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_GROUP_CHANNEL_CREATED } from '~/constants/socket_events';
import { Channel, IChannelDoc, IChatChannel, Message } from '~/models';
import type { IUserDoc } from '~/models';
import type { IStoreGroupChannelRequestBody } from '~/requestsParts/channel';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Group_Store', () => {
  setupDB();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to create a new group channel', async () => {
    const user1: IUserDoc = await factory.create<IUserDoc>('User');
    const user2: IUserDoc = await factory.create<IUserDoc>('User');
    const user3: IUserDoc = await factory.create<IUserDoc>('User');

    const groupName = 'Group 1';

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user1._id };
      throw new Error();
    });

    const io = IoService.instance();
    const ioSpy = jest.spyOn(io, 'emit').mockReturnValueOnce(Promise.resolve());

    const requestBody: IStoreGroupChannelRequestBody = {
      name: groupName,
      members: [user2._id.toString(), user3._id.toString()],
      admins: [user1._id.toString()],
    };

    const res = await request
      .post('/api/channel/group')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(201);

    const channelRecord = (await Channel.findOne({
      $and: [
        { isGroup: true },
        { 'members.userId': user1._id },
        { 'members.userId': user2._id },
        { 'members.userId': user3._id },
      ],
    })) as IChannelDoc;

    const unreadMsgs: number = await Message.countDocuments({
      channelId: channelRecord._id.toString(),
    });

    expect(channelRecord).toBeTruthy();
    expect(channelRecord.name).toBe(groupName);
    expect(channelRecord.members[0].isAdm).toBe(true);
    expect(unreadMsgs >= 1).toBe(true);

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_GROUP_CHANNEL_CREATED);
    expect((ioSpy.mock.calls[0][1] as IChatChannel)._id).toBe(
      channelRecord._id.toString(),
    );
  });

  it('should not be able to create a new group channel with invalid memberIds', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const requestBody: IStoreGroupChannelRequestBody = {
      name: 'Group 1',
      members: ['some-user-id-1', 'some-user-id-2'],
      admins: [user._id.toString()],
    };

    const res = await request
      .post('/api/channel/group')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(requestBody);

    expect(res.status).toBe(400);
  });
});

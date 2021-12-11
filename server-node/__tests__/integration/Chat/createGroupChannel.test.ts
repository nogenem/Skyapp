import jsonwebtoken from 'jsonwebtoken';
import supertest from 'supertest';

import app from '~/app';
import { IO_GROUP_CHANNEL_CREATED } from '~/constants/socket_events';
import type { INewGroupCredentials } from '~/controllers';
import { Channel, IChannelDoc, IChatChannel, Message } from '~/models';
import type { IUserDoc } from '~/models';
import { IoService } from '~/services';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const request = supertest(app);

const VALID_TOKEN = '123456789';

describe('Create_Group_Channel', () => {
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

    const credentials: INewGroupCredentials = {
      name: groupName,
      members: [user2._id.toString(), user3._id.toString()],
      admins: [user1._id.toString()],
    };

    const res = await request
      .post('/api/chat/group')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(201);

    const channelRecord = (await Channel.findOne({
      $and: [
        { is_group: true },
        { 'members.user_id': user1._id },
        { 'members.user_id': user2._id },
        { 'members.user_id': user3._id },
      ],
    })) as IChannelDoc;

    const unreadMsgs: number = await Message.countDocuments({
      channel_id: channelRecord._id.toString(),
    });

    expect(channelRecord).toBeTruthy();
    expect(channelRecord.name).toBe(groupName);
    expect(channelRecord.members[0].is_adm).toBe(true);
    expect(unreadMsgs >= 1).toBe(true);

    expect(ioSpy).toHaveBeenCalled();
    expect(ioSpy.mock.calls[0][0]).toBe(IO_GROUP_CHANNEL_CREATED);
    expect((ioSpy.mock.calls[0][1] as IChatChannel)._id).toBe(
      channelRecord._id.toString(),
    );
  });

  it('should not be able to create a new group channel with invalid member_ids', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    jest.spyOn(jsonwebtoken, 'verify').mockImplementation(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });

    const credentials: INewGroupCredentials = {
      name: 'Group 1',
      members: ['some-user-id-1', 'some-user-id-2'],
      admins: [user._id.toString()],
    };

    const res = await request
      .post('/api/chat/group')
      .set('authorization', `Bearer ${VALID_TOKEN}`)
      .send(credentials);

    expect(res.status).toBe(400);
  });
});

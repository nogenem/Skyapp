import { IChannelDoc, IMessageDoc } from '~/models';
import getUsersAndChannelsData from '~/utils/getUsersAndChannelsData';
import factory from '~t/factories';

import { setupDB } from '../../test-setup';

describe('getUsersAndChannelsData', () => {
  setupDB();

  it('should return the users and channels correctly', async () => {
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {},
      { membersLen: 2 },
    );
    const currentUserId = channel.members[0].user_id.toString();
    const otherMemberId = channel.members[1].user_id.toString();
    const message = await factory.create<IMessageDoc>('Message', {
      channel_id: channel._id,
      from_id: currentUserId,
    });

    const data = await getUsersAndChannelsData(currentUserId, {});

    expect(Object.keys(data.users).length).toBe(1);
    expect(data.users[otherMemberId]).toBeTruthy();
    expect(Object.keys(data.channels).length).toBe(1);
    expect(data.channels[channel._id.toString()]).toBeTruthy();
    expect(
      data.channels[channel._id.toString()].lastMessage?._id.toString(),
    ).toBe(message._id.toString());
  });
});

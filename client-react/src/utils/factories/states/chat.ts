import faker from 'faker/locale/en_US';

import { initialState } from '~/redux/chat/reducer';
import type {
  IChannel,
  IChannels,
  IOtherUser,
  IOtherUsers,
  TChatState,
} from '~/redux/chat/types';

import activeChannelInfoFactory from '../models/activeChannelInfo';
import channelFactory from '../models/channel';
import otherUserFactory from '../models/otherUser';

interface IOptions {
  useConstValues: boolean;
  useInitialState: boolean;
  usersLen: number;
  channelsLen: number;
}

export default (
  override?: Partial<TChatState>,
  options?: Partial<IOptions>,
): TChatState => {
  let usersLen = faker.datatype.number({ min: 0, max: 2 });
  if (options?.usersLen !== undefined && options.usersLen >= 0) {
    usersLen = options.usersLen;
  } else if (options?.useConstValues) {
    usersLen = 2;
  }

  let tmpOtherUsers: IOtherUser[] = [];
  if (!options?.useConstValues) {
    tmpOtherUsers = Array.from({ length: usersLen }, () => otherUserFactory());
  } else {
    tmpOtherUsers = Array.from({ length: usersLen }, (_, idx) =>
      otherUserFactory(
        { _id: `other-user-${idx}`, channel_id: `channel-${idx}` },
        { useConstValues: true },
      ),
    );
  }

  const users: IOtherUsers = {};
  tmpOtherUsers.forEach(user => {
    users[user._id] = user;
  });

  let channelsLen = faker.datatype.number({ min: 0, max: 2 });
  if (options?.channelsLen !== undefined && options.channelsLen >= 0) {
    channelsLen = options.channelsLen;
  } else if (options?.useConstValues) {
    channelsLen = 2;
  }

  let tmpChannels: IChannel[] = [];
  if (!options?.useConstValues) {
    tmpChannels = Array.from({ length: channelsLen }, () => channelFactory());
  } else {
    tmpChannels = Array.from({ length: channelsLen }, (_, idx) =>
      channelFactory({ _id: `channel-${idx}` }, { useConstValues: true }),
    );
  }

  const channels: IChannels = {};
  tmpChannels.forEach(channel => {
    channels[channel._id] = channel;
  });

  let activeChannelInfo =
    Math.random() < 0.5 ? undefined : activeChannelInfoFactory();
  if (options?.useConstValues) activeChannelInfo = undefined;

  return options?.useInitialState
    ? initialState
    : ({
        users,
        channels,
        activeChannelInfo,
        ...(override || {}),
      } as TChatState);
};

export type { IOptions };

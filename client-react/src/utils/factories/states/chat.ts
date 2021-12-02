import faker from 'faker/locale/en_US';

import { initialState } from '~/redux/chat/reducer';
import type { IChannels, IOtherUsers, TChatState } from '~/redux/chat/types';

import activeChannelInfoFactory from '../models/activeChannelInfo';
import channelFactory from '../models/channel';
import otherUserFactory from '../models/otherUser';

interface IOptions {
  useInitialState: boolean;
  usersLen: number;
  channelsLen: number;
}

export default (
  override?: Partial<TChatState>,
  options?: Partial<IOptions>,
): TChatState => {
  const usersLen =
    options?.usersLen !== undefined && options?.usersLen !== null
      ? options?.usersLen
      : faker.datatype.number({ min: 0, max: 2 });
  const users: IOtherUsers = Array.from({ length: usersLen }, () =>
    otherUserFactory({}),
  ).reduce((prev, curr) => {
    prev[curr._id] = curr;
    return prev;
  }, {} as IOtherUsers);

  const channelsLen =
    options?.channelsLen !== undefined && options?.channelsLen !== null
      ? options?.channelsLen
      : faker.datatype.number({ min: 0, max: 2 });
  const channels: IChannels = Array.from({ length: channelsLen }, () =>
    channelFactory({}),
  ).reduce((prev, curr) => {
    prev[curr._id] = curr;
    return prev;
  }, {} as IChannels);

  return options?.useInitialState
    ? initialState
    : ({
        users,
        channels,
        activeChannelInfo:
          Math.random() < 0.5 ? undefined : activeChannelInfoFactory({}),
        ...(override || {}),
      } as TChatState);
};

export type { IOptions };

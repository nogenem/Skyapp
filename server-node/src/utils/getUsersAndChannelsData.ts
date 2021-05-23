import mongoose from 'mongoose';

import User from '~/models/User';
import { IClientMap } from '~/typescript-declarations/io.d';

interface IOtherUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: number;
  online: boolean;
}

interface IOtherUsers {
  [_id: string]: IOtherUser;
}

interface IChannel {
  _id: string;
}

interface IChannels {
  [_id: string]: IChannel;
}

interface IInitialData {
  users: IOtherUsers;
  channels: IChannels;
}

export default async (
  currentUserId: string,
  currentClients: IClientMap,
): Promise<IInitialData> => {
  const objectId = mongoose.Types.ObjectId;

  const channels = {};

  const tmpUsers = await User.find(
    { _id: { $ne: objectId(currentUserId) }, confirmed: true },
    '_id nickname thoughts status',
  );

  const users: IOtherUsers = {};
  for (let i = 0; i < tmpUsers.length; i += 1) {
    const tmpUser = tmpUsers[i].toJSON();
    const user: IOtherUser = {
      _id: tmpUser._id,
      nickname: tmpUser.nickname,
      thoughts: tmpUser.thoughts,
      status: tmpUser.status,
      online: !!currentClients[tmpUser._id],
    };
    users[user._id] = user;
  }

  return {
    users,
    channels,
  };
};

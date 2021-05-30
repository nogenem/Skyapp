/* eslint-disable camelcase */
import mongoose, { Document, Model } from 'mongoose';

import Message, { IChatMessage } from './Message';

interface IMember {
  user_id: string;
  is_adm: boolean;
  last_seen: Date;
}

interface IMemberDoc extends IMember, Document {}

interface IChannel {
  name: string;
  is_group: boolean;
  members: IMemberDoc[];
}

interface IChatChannel {
  _id: string;
  name: string;
  is_group: boolean;
  members: IMember[];
  other_member_idx?: number;
  unread_msgs: number;
  lastMessage?: IChatMessage;
}

interface IChannelDoc extends IChannel, Document {
  createdAt: Date;
  updatedAt: Date;

  toChatChannel: () => IChatChannel;
}

interface IChatModel extends Model<IChannelDoc> {
  toChatChannel: (
    channel?: IChannelDoc | IChatChannel,
  ) => IChatChannel | undefined;
}

const Member = new mongoose.Schema<IMemberDoc>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  is_adm: { type: Boolean, default: false },
  last_seen: { type: Date, default: Date.now },
});

const Channel = new mongoose.Schema<IChannelDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    is_group: { type: Boolean, required: true },
    members: [Member],
  },
  { timestamps: true },
);

function toChatChannel(channel: IChannelDoc | IChatChannel): IChatChannel {
  const oldChatChannel = channel as IChatChannel;
  return {
    _id: channel._id.toString(),
    name: channel.name,
    is_group: channel.is_group,
    // It doesn't matter if it's `IMember` or `IMemberDoc`
    members: oldChatChannel.members.map(member => ({
      user_id: member.user_id.toString(),
      is_adm: member.is_adm,
      last_seen: member.last_seen,
    })),
    other_member_idx: Number.isInteger(oldChatChannel.other_member_idx)
      ? oldChatChannel.other_member_idx
      : undefined,
    unread_msgs: oldChatChannel.unread_msgs || 0,
    lastMessage: Message.toChatMessage(oldChatChannel.lastMessage),
  };
}

Channel.static(
  'toChatChannel',
  function staticToChatChannel(channel?: IChannelDoc | IChatChannel) {
    if (!channel) return undefined;
    return toChatChannel(channel);
  },
);

Channel.method('toChatChannel', function modelToChatChannel() {
  return toChatChannel(this);
});

export type { IMember, IMemberDoc, IChannel, IChannelDoc, IChatChannel };
export default mongoose.model<IChannelDoc, IChatModel>('Channel', Channel);

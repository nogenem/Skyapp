import mongoose, { Document, Model, Types } from 'mongoose';

import Message, { IChatMessage } from './Message';

interface IMember {
  userId: string;
  isAdm: boolean;
  lastSeen: Date;
}

interface IMemberDoc extends IMember, Types.EmbeddedDocument {}

interface IChannel {
  name: string;
  isGroup: boolean;
  members: Types.DocumentArray<IMemberDoc>;
}

interface IChatChannel {
  _id: string;
  name: string;
  isGroup: boolean;
  members: IMember[];
  otherMemberIdx?: number;
  unreadMsgs: number;
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  isAdm: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
});

const Channel = new mongoose.Schema<IChannelDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    isGroup: { type: Boolean, required: true },
    members: [Member],
  },
  { timestamps: true },
);

function toChatChannel(channel: IChannelDoc | IChatChannel): IChatChannel {
  const oldChatChannel = channel as IChatChannel;
  return {
    _id: channel._id.toString(),
    name: channel.name,
    isGroup: channel.isGroup,
    // It doesn't matter if it's `IMember` or `IMemberDoc`
    members: oldChatChannel.members.map(member => ({
      userId: member.userId.toString(),
      isAdm: member.isAdm,
      lastSeen: member.lastSeen,
    })),
    otherMemberIdx: Number.isInteger(oldChatChannel.otherMemberIdx)
      ? oldChatChannel.otherMemberIdx
      : undefined,
    unreadMsgs: oldChatChannel.unreadMsgs || 0,
    lastMessage: Message.toChatMessage(oldChatChannel.lastMessage),
  };
}

Channel.pre('remove', async function beforeRemove() {
  await Message.deleteMany({ channelId: this._id });
});

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

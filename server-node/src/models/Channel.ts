/* eslint-disable camelcase */
import mongoose, { Document } from 'mongoose';

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

interface IAuthChannel {
  _id: string;
  name: string;
  is_group: boolean;
  members: IMember[];
}

interface IChannelDoc extends IChannel, Document {
  createdAt: Date;
  updatedAt: Date;

  toAuthJSON: () => IAuthChannel;
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

Channel.method('toAuthJSON', function toAuthJSON() {
  return {
    _id: this._id,
    name: this.name,
    is_group: this.is_group,
    members: this.members.map(member => ({
      user_id: member.user_id,
      is_adm: member.is_adm,
      last_seen: member.last_seen,
    })),
  };
});

export type { IMember, IMemberDoc, IChannel, IChannelDoc, IAuthChannel };
export default mongoose.model<IChannelDoc>('Channel', Channel);

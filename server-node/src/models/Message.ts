import mongoose, { Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { MESSAGE_TYPES, TMessageType } from '~/constants/message_types';

const MESSAGE_TYPES_VALUES = Object.values(MESSAGE_TYPES);

interface IAttachment {
  originalName: string;
  size: number;
  path: string;
  mimeType: string;
  imageDimensions?: { width: number; height: number };
}

interface IMessage {
  channelId: string;
  fromId?: string;
  body: string | IAttachment;
  type: TMessageType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IChatMessage {
  _id: string;
  channelId: string;
  fromId?: string;
  body: string | IAttachment;
  type: TMessageType;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessageDoc extends IMessage, Document {
  createdAt: Date;
  updatedAt: Date;

  toChatMessage: () => IChatMessage;
}

interface IMessageModel extends Model<IMessageDoc>, PaginateModel<IMessageDoc> {
  toChatMessage: (
    channel?: IMessageDoc | IChatMessage,
  ) => IChatMessage | undefined;
}

const Message = new mongoose.Schema<IMessageDoc>(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    body: { type: mongoose.Schema.Types.Mixed, required: true },
    type: { type: Number, required: true, enum: MESSAGE_TYPES_VALUES },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  // { timestamps: true },
);

Message.pre(/'update|updateOne|findOneAndUpdate/, function preUpdate() {
  this.update({}, { $set: { updatedAt: new Date() } });
});

function toChatMessage(message: IMessageDoc | IChatMessage): IChatMessage {
  return {
    _id: message._id.toString(),
    channelId: message.channelId.toString(),
    fromId: message.fromId ? message.fromId.toString() : message.fromId,
    body: message.body,
    type: message.type,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

Message.static(
  'toChatMessage',
  function staticToChatChannel(message?: IMessageDoc | IChatMessage) {
    if (!message) return undefined;
    return toChatMessage(message);
  },
);

Message.method('toChatMessage', function ModelToChatMessage() {
  return toChatMessage(this);
});

Message.plugin(schema => {
  const convertedSchema = schema as unknown as mongoose.Schema;
  return mongoosePaginate(convertedSchema);
});

export type { IAttachment, IMessage, IMessageDoc, IChatMessage };
export default mongoose.model<IMessageDoc, IMessageModel>('Message', Message);

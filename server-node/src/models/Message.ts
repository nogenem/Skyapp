/* eslint-disable camelcase */
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
  channel_id: string;
  from_id?: string;
  body: string | IAttachment;
  type: TMessageType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IChatMessage {
  _id: string;
  channel_id: string;
  from_id?: string;
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
    channel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    from_id: {
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

Message.pre('update', function preUpdate() {
  this.update({}, { $set: { updatedAt: new Date() } });
});

function toChatMessage(message: IMessageDoc | IChatMessage): IChatMessage {
  return {
    _id: message._id.toString(),
    channel_id: message.channel_id.toString(),
    from_id: message.from_id ? message.from_id.toString() : message.from_id,
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

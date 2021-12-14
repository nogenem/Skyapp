import { Response } from 'express';
import fs from 'fs';
import sizeOfImage from 'image-size';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  FILES_UPLOADED,
  MESSAGE_DELETED,
  MESSAGE_EDITED,
  MESSAGE_SENT,
} from '~/constants/return_messages';
import {
  IO_MESSAGES_RECEIVED,
  IO_MESSAGE_EDITED,
  IO_MESSAGE_DELETED,
} from '~/constants/socket_events';
import type { IAuthRequest } from '~/middlewares/auth';
import {
  Channel,
  IAttachment,
  IChannelDoc,
  IMessage,
  IMessageDoc,
  IUserDoc,
  Message,
} from '~/models';
import { IoService } from '~/services';
import {
  cantDeleteThisMessageError,
  cantEditThisMessageError,
  invalidIdError,
  notMemberOfGroupError,
} from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';
import insertManyMessages from '~/utils/insertManyMessages';

interface IFetchMessagesCredentials {
  offset: number;
  limit?: number;
  sort?: string;
}

interface ISendMessageCredentials {
  body: string;
}

interface IEditMessageCredentials {
  newBody: string;
}

export default {
  async all(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
    const channelId = req.params.channel_id;
    const {
      offset,
      limit = 30,
      sort = '-createdAt',
    } = req.query as unknown as IFetchMessagesCredentials;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channelRecord = await Channel.findOne({
        _id: channelId,
        'members.user_id': currentUser._id,
      });

      if (!channelRecord) {
        return handleErrors(notMemberOfGroupError(), res);
      }

      const messages = await Message.paginate(
        { channel_id: channelId },
        {
          offset,
          limit,
          sort,
          select: '_id channel_id from_id body type createdAt updatedAt',
        },
      );
      if (!messages) {
        return handleErrors(invalidIdError(), res);
      }

      return res.status(200).json(messages);
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async storeMessage(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const channelId = req.params.channel_id;
    const { body } = req.body as unknown as ISendMessageCredentials;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channel = await Channel.findOne({ _id: channelId });
      if (!channel) {
        return handleErrors(invalidIdError(), res);
      }

      const msgObj = new Message({
        channel_id: channelId,
        from_id: currentUser._id,
        body,
        type: MESSAGE_TYPES.TEXT,
      });

      const channelJson = channel.toChatChannel();
      const messageRecord = (await msgObj.save()) as IMessageDoc;
      const messageJson = messageRecord.toChatMessage();

      const io = IoService.instance();

      await io.emit(IO_MESSAGES_RECEIVED, {
        channel: channelJson,
        messages: [messageJson],
      });
      return res.status(200).json({
        message: req.t(MESSAGE_SENT),
        messageObj: messageJson,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async storeFiles(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const channelId = req.params.channel_id;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channel = await Channel.findOne({ _id: channelId });
      if (!channel) {
        return handleErrors(invalidIdError(), res);
      }

      const reqFiles = req?.files as Express.Multer.File[];
      const files: IAttachment[] = [];
      reqFiles.forEach(file => {
        const path = file.path.replace(/\\/gi, '/');
        let imageDimensions;
        if (file.mimetype.startsWith('image/')) {
          const dimensions = sizeOfImage(path);
          imageDimensions = {
            width: dimensions.width || 0,
            height: dimensions.height || 0,
          };
        }

        files.push({
          originalName: file.originalname,
          size: file.size,
          path,
          mimeType: file.mimetype,
          imageDimensions,
        });
      });

      const messages: IMessage[] = [];
      files.forEach(file => {
        messages.push({
          channel_id: channel._id as string,
          from_id: currentUser._id,
          body: file,
          type: MESSAGE_TYPES.UPLOADED_FILE,
        });
      });

      const channelJson = channel.toChatChannel();
      const messagesRecord = await insertManyMessages(messages);
      const messageJson = messagesRecord.map(message =>
        message.toChatMessage(),
      );

      const io = IoService.instance();
      io.emit(IO_MESSAGES_RECEIVED, {
        channel: channelJson,
        messages: messageJson,
      });
      return res.status(200).json({
        message: req.t(FILES_UPLOADED),
        messagesObjs: messageJson,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async updateBody(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const channelId = req.params.channel_id;
    const messageId = req.params.message_id;
    const { newBody } = req.body as unknown as IEditMessageCredentials;
    const currentUser = req.currentUser as IUserDoc;

    try {
      // You can only edit YOUR TEXT message
      const messageRecord = await Message.findOneAndUpdate(
        {
          _id: messageId,
          channel_id: channelId,
          from_id: currentUser._id,
          type: MESSAGE_TYPES.TEXT,
        },
        { body: newBody },
        { new: true },
      );
      if (!messageRecord) {
        return handleErrors(cantEditThisMessageError(), res);
      }

      const messageJson = messageRecord.toChatMessage();
      const channelRecord = (await Channel.findOne({
        _id: messageJson.channel_id,
      })) as IChannelDoc;
      const channelJson = channelRecord.toChatChannel();

      const io = IoService.instance();

      await io.emit(IO_MESSAGE_EDITED, {
        channel: channelJson,
        message: messageJson,
      });
      return res.status(200).json({
        message: req.t(MESSAGE_EDITED),
        messageObj: messageJson,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async delete(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
    const channelId = req.params.channel_id;
    const messageId = req.params.message_id;
    const currentUser = req.currentUser as IUserDoc;

    try {
      // You can only edit YOUR message
      const messageRecord = await Message.findOne({
        _id: messageId,
        channel_id: channelId,
        from_id: currentUser._id,
      });
      if (!messageRecord) {
        return handleErrors(cantDeleteThisMessageError(), res);
      }

      await Message.deleteOne({ _id: messageId, from_id: currentUser._id });

      if (messageRecord.type === MESSAGE_TYPES.UPLOADED_FILE) {
        const body = messageRecord.body as IAttachment;
        if (fs.existsSync(body.path)) {
          fs.unlinkSync(body.path);
        }
      }

      const lastMessageRecord = await Message.findOne(
        { channel_id: messageRecord.channel_id },
        null,
        {
          sort: '-createdAt',
        },
      );

      const messageJson = messageRecord.toChatMessage();
      const lastMessageJson = lastMessageRecord?.toChatMessage();
      const channelRecord = (await Channel.findOne({
        _id: messageJson.channel_id,
      })) as IChannelDoc;
      const channelJson = channelRecord.toChatChannel();

      const io = IoService.instance();

      await io.emit(IO_MESSAGE_DELETED, {
        channel: channelJson,
        message: messageJson,
        lastMessage: lastMessageJson,
      });
      return res.status(200).json({
        message: req.t(MESSAGE_DELETED),
        messageObj: messageJson,
        lastMessage: lastMessageJson,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
};

export type {
  IFetchMessagesCredentials,
  ISendMessageCredentials,
  IEditMessageCredentials,
};

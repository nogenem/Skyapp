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
  IMessage,
  IMessageDoc,
  IUserDoc,
  Message,
} from '~/models';
import type {
  IDeleteMessageRequestParams,
  IFetchMessagesRequestParams,
  IFetchMessagesRequestQuery,
  IStoreFilesRequestParams,
  IStoreMessageRequestBody,
  IStoreMessageRequestParams,
  IUpdateMessageBodyRequestBody,
  IUpdateMessageBodyRequestParams,
} from '~/requestsParts/message';
import { IoService } from '~/services';
import {
  cantDeleteThisMessageError,
  cantEditThisMessageError,
  invalidIdError,
  notMemberOfChannelError,
} from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';
import insertManyMessages from '~/utils/insertManyMessages';

export default {
  async all(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
    const { channelId } = req.params as unknown as IFetchMessagesRequestParams;
    const {
      offset,
      limit = 30,
      sort = '-createdAt',
    } = req.query as unknown as IFetchMessagesRequestQuery;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channelRecord = await Channel.findOne({
        _id: channelId,
        'members.userId': currentUser._id,
      });

      if (!channelRecord) {
        return handleErrors(notMemberOfChannelError(), res);
      }

      const messages = await Message.paginate(
        { channelId },
        {
          offset,
          limit,
          sort,
          select: '_id channelId fromId body type createdAt updatedAt',
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
    const { channelId } = req.params as unknown as IStoreMessageRequestParams;
    const { body } = req.body as IStoreMessageRequestBody;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channel = await Channel.findOne({
        _id: channelId,
        'members.userId': currentUser._id,
      });

      if (!channel) {
        return handleErrors(notMemberOfChannelError(), res);
      }

      const msgObj = new Message({
        channelId,
        fromId: currentUser._id,
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
    const { channelId } = req.params as unknown as IStoreFilesRequestParams;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channel = await Channel.findOne({
        _id: channelId,
        'members.userId': currentUser._id,
      });

      if (!channel) {
        return handleErrors(notMemberOfChannelError(), res);
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
          channelId: channel._id as string,
          fromId: currentUser._id,
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
    const { channelId, messageId } =
      req.params as unknown as IUpdateMessageBodyRequestParams;
    const { newBody } = req.body as unknown as IUpdateMessageBodyRequestBody;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channelRecord = await Channel.findOne({
        _id: channelId,
        'members.userId': currentUser._id,
      });

      if (!channelRecord) {
        return handleErrors(notMemberOfChannelError(), res);
      }

      // You can only edit YOUR TEXT message
      const messageRecord = await Message.findOneAndUpdate(
        {
          _id: messageId,
          channelId,
          fromId: currentUser._id,
          type: MESSAGE_TYPES.TEXT,
        },
        { body: newBody },
        { new: true },
      );
      if (!messageRecord) {
        return handleErrors(cantEditThisMessageError(), res);
      }

      const messageJson = messageRecord.toChatMessage();
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
    const { channelId, messageId } =
      req.params as unknown as IDeleteMessageRequestParams;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const channelRecord = await Channel.findOne({
        _id: channelId,
        'members.userId': currentUser._id,
      });

      if (!channelRecord) {
        return handleErrors(notMemberOfChannelError(), res);
      }

      // You can only edit YOUR message
      const messageRecord = await Message.findOne({
        _id: messageId,
        channelId,
        fromId: currentUser._id,
      });
      if (!messageRecord) {
        return handleErrors(cantDeleteThisMessageError(), res);
      }

      await Message.deleteOne({ _id: messageId, fromId: currentUser._id });

      if (messageRecord.type === MESSAGE_TYPES.UPLOADED_FILE) {
        const body = messageRecord.body as IAttachment;
        if (fs.existsSync(body.path)) {
          fs.unlinkSync(body.path);
        }
      }

      const lastMessageRecord = await Message.findOne(
        { channelId: messageRecord.channelId },
        null,
        {
          sort: '-createdAt',
        },
      );

      const messageJson = messageRecord.toChatMessage();
      const lastMessageJson = lastMessageRecord?.toChatMessage();
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

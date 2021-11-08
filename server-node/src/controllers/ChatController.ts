import { Response } from 'express';
import { Types as MongooseTypes } from 'mongoose';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  CHANNEL_CREATED,
  CHANNEL_UPDATED,
  FILES_UPLOADED,
  MESSAGE_SENT,
  REMOVED_FROM_GROUP,
} from '~/constants/return_messages';
import {
  IO_PRIVATE_CHANNEL_CREATED,
  IO_GROUP_CHANNEL_CREATED,
  IO_REMOVED_FROM_GROUP_CHANNEL,
  IO_GROUP_CHANNEL_UPDATED,
  IO_MESSAGES_RECEIVED,
} from '~/constants/socket_events';
import type { IAuthRequest } from '~/middlewares/auth';
import {
  Channel,
  IAttachment,
  IChannelDoc,
  IMemberDoc,
  IMessage,
  IMessageDoc,
  IUserDoc,
  Message,
  User,
} from '~/models';
import { IoService } from '~/services';
import {
  channelAlreadyExistsError,
  invalidIdError,
  notMemberOfGroupError,
  userIsNotGroupAdmError,
} from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';

interface INewGroupCredentials {
  name: string;
  members: string[];
  admins: string[];
}

interface IUpdateGroupCredentials {
  // eslint-disable-next-line camelcase
  channel_id: string;
  name: string;
  members: string[];
  admins: string[];
}

interface ILeaveGroupCredentials {
  // eslint-disable-next-line camelcase
  channel_id: string;
}

interface IFetchMessagesCredentials {
  // eslint-disable-next-line camelcase
  channel_id: string;
  offset: number;
  limit?: number;
  sort?: string;
}

interface ISendMessageCredentials {
  // eslint-disable-next-line camelcase
  channel_id: string;
  body: string;
}

const insertManyMessages = (messages: IMessage[]): Promise<IMessageDoc[]> => {
  // Without this, all dates would be the same...
  const baseDate = new Date().getTime();
  const messages2insert = messages.map((message, i) => {
    return {
      ...message,
      createdAt: new Date(baseDate + i),
      updatedAt: new Date(baseDate + i),
    };
  });
  return Message.insertMany(messages2insert);
};

export default {
  async createPrivateChannel(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { _id } = req.body;
    const currentUser = req.currentUser as IUserDoc;
    let user;

    try {
      user = await User.findOne({ _id });
      if (!user) {
        return handleErrors(invalidIdError(), res);
      }

      const channel = await Channel.findOne({
        $and: [
          { 'members.user_id': currentUser._id },
          { 'members.user_id': user._id },
        ],
      });
      if (channel) {
        return handleErrors(channelAlreadyExistsError(), res);
      }
    } catch (err) {
      return handleErrors(err as Error, res);
    }

    try {
      const channel = new Channel({
        name: 'private channel',
        is_group: false,
        members: [
          {
            user_id: currentUser._id,
            is_adm: false,
          },
          {
            user_id: user._id,
            is_adm: false,
          },
        ],
      });

      const channelRecord = (await channel.save()) as IChannelDoc;
      const channelJson = channel.toChatChannel();

      const io = IoService.instance();

      await io.emit(IO_PRIVATE_CHANNEL_CREATED, channelJson);

      return res.status(201).json({
        message: CHANNEL_CREATED,
        channel_id: channelRecord._id,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async createGroupChannel(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const {
      name,
      members: membersIds,
      admins: adminsIds,
    } = req.body as INewGroupCredentials;
    const currentUser = req.currentUser as IUserDoc;

    try {
      const membersRecords = await User.find(
        { _id: { $in: membersIds } },
        { nickname: 1 },
      );

      const adminsIdsObj = {} as { [id: string]: boolean };
      adminsIds.forEach(id => {
        adminsIdsObj[id] = true;
      });

      const members = membersIds.map(id => ({
        user_id: id,
        is_adm: !!adminsIdsObj[id],
      }));

      const channel = new Channel({
        name,
        is_group: true,
        members: [
          {
            user_id: currentUser._id,
            is_adm: true,
          },
          ...members,
        ],
      });

      const channelRecord = (await channel.save()) as IChannelDoc;
      const io = IoService.instance();

      const newMembersMessages = [] as IMessage[];
      const newAdminsMessages = [] as IMessage[];
      membersRecords.forEach(member => {
        const memberId = member._id.toString();

        newMembersMessages.push({
          channel_id: channelRecord._id,
          body: `${currentUser.nickname} added ${member.nickname}`,
          type: MESSAGE_TYPES.TEXT,
        });

        if (adminsIdsObj[memberId])
          newAdminsMessages.push({
            channel_id: channelRecord._id,
            body: `${member.nickname} is now an Admin`,
            type: MESSAGE_TYPES.TEXT,
          });
      });

      const messages = [...newMembersMessages, ...newAdminsMessages];
      const messagesRecord = await insertManyMessages(messages);

      const latestMessage = messagesRecord[messagesRecord.length - 1];
      const channelJson = channelRecord.toChatChannel();
      channelJson.lastMessage = latestMessage.toChatMessage();
      channelJson.unread_msgs = messages.length;

      await io.emit(IO_GROUP_CHANNEL_CREATED, channelJson);

      return res.status(201).json({
        message: CHANNEL_CREATED,
        channel_id: channelJson._id,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async updateGroupChannel(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const {
      channel_id: channelId,
      name,
      members: membersIds,
      admins: adminsIds,
    } = req.body as IUpdateGroupCredentials;
    const currentUser = req.currentUser as IUserDoc;

    let channel: IChannelDoc | null = null;
    try {
      channel = await Channel.findOne({ _id: channelId });
      if (!channel) {
        return handleErrors(invalidIdError(), res);
      }

      const membersIdsObj = {} as { [id: string]: boolean };
      membersIds.forEach(id => {
        membersIdsObj[id] = true;
      });

      const adminsIdsObj = {} as { [id: string]: boolean };
      adminsIds.forEach(id => {
        adminsIdsObj[id] = true;
      });

      const members = new MongooseTypes.DocumentArray<IMemberDoc>([]);
      const newMembers = [] as string[];
      const removedMembers = [] as string[];
      const newAdmins = [] as string[];
      const removedAdmins = [] as string[];
      let isCurrentUserAdm = false;
      for (let i = 0; i < channel.members.length; i += 1) {
        const member = channel.members[i];
        if (currentUser._id.toString() === member.user_id.toString()) {
          members.push(member);
          isCurrentUserAdm = member.is_adm;

          delete membersIdsObj[member.user_id];
          delete adminsIdsObj[member.user_id];
        } else if (membersIdsObj[member.user_id]) {
          const oldIsAdm = member.is_adm;
          const newIsAdm = !!adminsIdsObj[member.user_id];
          if (oldIsAdm !== newIsAdm) {
            if (!newIsAdm) removedAdmins.push(member.user_id);
            else newAdmins.push(member.user_id);
          }

          member.is_adm = newIsAdm;
          members.push(member);

          delete membersIdsObj[member.user_id];
          delete adminsIdsObj[member.user_id];
        } else {
          removedMembers.push(member.user_id);
        }
      }

      if (!isCurrentUserAdm) {
        return handleErrors(userIsNotGroupAdmError(), res);
      }

      Object.keys(membersIdsObj).forEach(id => {
        members.push({
          user_id: id,
          is_adm: !!adminsIdsObj[id],
        });
        newMembers.push(id);
        if (adminsIdsObj[id]) newAdmins.push(id);
      });

      const membersRecords = await User.find(
        {
          _id: {
            $in: [
              ...newMembers,
              ...removedMembers,
              ...newAdmins,
              ...removedAdmins,
            ],
          },
        },
        { nickname: 1 },
      );

      const membersRecordsObj = {} as { [_id: string]: string };
      membersRecords.forEach(member => {
        membersRecordsObj[member._id.toString()] = member.nickname;
      });

      const messages = [] as IMessage[];
      newMembers.forEach(id => {
        messages.push({
          channel_id: channel?._id,
          body: `${currentUser.nickname} added ${membersRecordsObj[id]}`,
          type: MESSAGE_TYPES.TEXT,
        });
      });
      removedMembers.forEach(id => {
        messages.push({
          channel_id: channel?._id,
          body: `${currentUser.nickname} removed ${membersRecordsObj[id]}`,
          type: MESSAGE_TYPES.TEXT,
        });
      });
      newAdmins.forEach(id => {
        messages.push({
          channel_id: channel?._id,
          body: `${membersRecordsObj[id]} is now an Admin`,
          type: MESSAGE_TYPES.TEXT,
        });
      });
      removedAdmins.forEach(id => {
        messages.push({
          channel_id: channel?._id,
          body: `${membersRecordsObj[id]} is no longer an Admin`,
          type: MESSAGE_TYPES.TEXT,
        });
      });

      channel.name = name;
      channel.members = members;

      const channelRecord = (await channel.save()) as IChannelDoc;
      const messagesRecord = await insertManyMessages(messages);
      const messagesJson = messagesRecord.map(message =>
        message.toChatMessage(),
      );

      const latestMessage = messagesJson[messagesJson.length - 1];
      const channelJson = channelRecord.toChatChannel();
      channelJson.lastMessage = latestMessage;

      const io = IoService.instance();

      await io.emit(IO_REMOVED_FROM_GROUP_CHANNEL, {
        channel: channelJson,
        members: removedMembers,
      });
      await io.emit(IO_GROUP_CHANNEL_UPDATED, channelJson);
      await io.emit(IO_MESSAGES_RECEIVED, {
        channel: channelJson,
        messages: messagesJson,
      });

      return res.status(200).json({
        message: CHANNEL_UPDATED,
        channel_id: channelJson._id,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async leaveGroupChannel(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { channel_id: channelId } = req.body as ILeaveGroupCredentials;
    const currentUser = req.currentUser as IUserDoc;
    const userId = currentUser._id.toString();

    let channel: IChannelDoc | null = null;
    try {
      channel = await Channel.findOne({ _id: channelId });

      if (!channel || !channel.is_group) {
        return handleErrors(invalidIdError(), res);
      }

      let hasOtherAdm = false;
      let memberId = '';
      let memberIsAdm = false;
      channel.members.forEach(m => {
        if (!memberId && m.user_id.toString() === userId) {
          memberIsAdm = m.is_adm;
          memberId = m._id;
        } else if (m.is_adm) {
          hasOtherAdm = true;
        }
      });

      if (!memberId) {
        return handleErrors(notMemberOfGroupError(), res);
      }

      if (channel.members.length === 1) {
        const channelJson = channel.toChatChannel();

        await channel.delete();

        const io = IoService.instance();
        await io.emit(IO_REMOVED_FROM_GROUP_CHANNEL, {
          channel: channelJson,
          members: [userId],
        });
      } else {
        channel.members.pull(memberId);

        const newAdmins: IMemberDoc[] = [];
        if (memberIsAdm && !hasOtherAdm) {
          channel.members.forEach(m => {
            /* eslint-disable no-param-reassign */
            m.is_adm = true;
            newAdmins.push(m._id);
          });
        }

        const message = new Message({
          channel_id: channelId,
          body: `${currentUser.nickname} left the group`,
          type: MESSAGE_TYPES.TEXT,
        });

        const promises = [channel.save(), message.save()] as [
          Promise<IChannelDoc>,
          Promise<IMessageDoc>,
        ];

        const [channelRecord, messageRecord] = await Promise.all(promises);
        const messageJson = messageRecord.toChatMessage();
        const channelJson = channelRecord.toChatChannel();
        channelJson.lastMessage = messageJson;

        const io = IoService.instance();

        await io.emit(IO_REMOVED_FROM_GROUP_CHANNEL, {
          channel: channelJson,
          members: [userId],
        });
        await io.emit(IO_GROUP_CHANNEL_UPDATED, channelJson);
        await io.emit(IO_MESSAGES_RECEIVED, {
          channel: channelJson,
          messages: [messageJson],
        });
      }

      return res.status(200).json({
        message: REMOVED_FROM_GROUP,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async getMessages(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const {
      channel_id: channelId,
      offset,
      limit = 30,
      sort = '-createdAt',
    } = req.query as unknown as IFetchMessagesCredentials;

    try {
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
  async sendMessage(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { channel_id: channelId, body } =
      req.body as unknown as ISendMessageCredentials;
    const currentUser = req.currentUser as IUserDoc;
    let channel: IChannelDoc | null = null;

    try {
      channel = await Channel.findOne({ _id: channelId });
      if (!channel) {
        return handleErrors(invalidIdError(), res);
      }
    } catch (err) {
      return handleErrors(err as Error, res);
    }

    const msgObj = new Message({
      channel_id: channelId,
      from_id: currentUser._id,
      body,
      type: MESSAGE_TYPES.TEXT,
    });

    try {
      const channelJson = channel.toChatChannel();
      const messageRecord = (await msgObj.save()) as IMessageDoc;
      const messageJson = messageRecord.toChatMessage();

      const io = IoService.instance();

      await io.emit(IO_MESSAGES_RECEIVED, {
        channel: channelJson,
        messages: [messageJson],
      });
      return res.status(200).json({
        message: MESSAGE_SENT,
        messageObj: messageJson,
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async sendFiles(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { channel_id: channelId } = req.body as {
      // eslint-disable-next-line camelcase
      channel_id: string;
    };
    const currentUser = req.currentUser as IUserDoc;
    let channel: IChannelDoc | null = null;

    try {
      channel = await Channel.findOne({ _id: channelId });
      if (!channel) {
        return handleErrors(invalidIdError(), res);
      }
    } catch (err) {
      return handleErrors(err as Error, res);
    }

    const reqFiles = req?.files as Express.Multer.File[];
    const files: IAttachment[] = reqFiles.map(file => ({
      originalName: file.originalname,
      size: file.size,
      path: file.path.replace(/\\/gi, '/'),
      mimeType: file.mimetype,
    }));

    const messages: IMessage[] = [];
    files.forEach(file => {
      messages.push({
        channel_id: channel?._id as string,
        from_id: currentUser._id,
        body: file,
        type: MESSAGE_TYPES.UPLOADED_FILE,
      });
    });

    const channelJson = channel.toChatChannel();
    const messagesRecord = await insertManyMessages(messages);
    const messageJson = messagesRecord.map(message => message.toChatMessage());

    const io = IoService.instance();
    io.emit(IO_MESSAGES_RECEIVED, {
      channel: channelJson,
      messages: messageJson,
    });
    return res.status(200).json({
      message: FILES_UPLOADED,
      messagesObjs: messageJson,
    });
  },
};

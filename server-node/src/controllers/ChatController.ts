import { Response } from 'express';

import { MESSAGE_TYPES } from '~/constants/message_types';
import { CHANNEL_CREATED } from '~/constants/return_messages';
import {
  IO_PRIVATE_CHANNEL_CREATED,
  IO_GROUP_CHANNEL_CREATED,
} from '~/constants/socket_events';
import IoController from '~/IoController';
import type { IAuthRequest } from '~/middlewares/auth';
import {
  Channel,
  IChannelDoc,
  IMessage,
  IUserDoc,
  Message,
  User,
} from '~/models';
import { channelAlreadyExistsError, invalidIdError } from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';

interface INewGroupCredentials {
  name: string;
  members: string[];
  admins: string[];
}

const insertManyMessages = (messages: IMessage[]) => {
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
      return handleErrors(err, res);
    }

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

    try {
      const channelRecord = (await channel.save()) as IChannelDoc;
      const io = IoController.instance();

      io.emit(IO_PRIVATE_CHANNEL_CREATED, channelRecord);
      return res.status(201).json({
        message: CHANNEL_CREATED,
        channel_id: channelRecord._id,
      });
    } catch (err) {
      return handleErrors(err, res);
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
      const io = IoController.instance();

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

      io.emit(IO_GROUP_CHANNEL_CREATED, channelJson);
      return res.status(201).json({
        message: CHANNEL_CREATED,
        channel_id: channelJson._id,
      });
    } catch (err) {
      return handleErrors(err, res);
    }
  },
};

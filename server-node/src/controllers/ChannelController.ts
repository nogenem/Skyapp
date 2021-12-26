import { Response } from 'express';
import { Types as MongooseTypes } from 'mongoose';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  CHANNEL_CREATED,
  CHANNEL_UPDATED,
  REMOVED_FROM_GROUP,
} from '~/constants/return_messages';
import {
  IO_PRIVATE_CHANNEL_CREATED,
  IO_GROUP_CHANNEL_CREATED,
  IO_REMOVED_FROM_GROUP_CHANNEL,
  IO_GROUP_CHANNEL_UPDATED,
  IO_MESSAGES_RECEIVED,
} from '~/constants/socket_events';
import { MIN_GROUP_CHANNEL_MEMBERS } from '~/constants/validation_limits';
import type { IAuthRequest } from '~/middlewares/auth';
import {
  Channel,
  IChannelDoc,
  IMemberDoc,
  IMessage,
  IMessageDoc,
  IUserDoc,
  Message,
  User,
} from '~/models';
import type {
  ILeaveGroupChannelRequestParams,
  IStoreGroupChannelRequestBody,
  IStorePrivateChannelRequestBody,
  IUpdateGroupChannelRequestBody,
  IUpdateGroupChannelRequestParams,
} from '~/requestsParts/channel';
import { IoService } from '~/services';
import {
  cantLeaveThisChannelError,
  cantUpdateThisGroupChannelError,
  channelAlreadyExistsError,
  groupHasTooFewMembersError,
  invalidIdError,
  notMemberOfGroupError,
  userIsNotGroupAdmError,
} from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';
import insertManyMessages from '~/utils/insertManyMessages';

export default {
  private: {
    async store(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
      const { otherUserId } = req.body as IStorePrivateChannelRequestBody;
      const currentUser = req.currentUser as IUserDoc;

      try {
        const otherUser = await User.findOne({ _id: otherUserId });
        if (!otherUser) {
          return handleErrors(invalidIdError(), res);
        }

        const alreadyExistingChannel = await Channel.findOne({
          $and: [
            { isGroup: false },
            { 'members.userId': currentUser._id },
            { 'members.userId': otherUser._id },
          ],
        });
        if (alreadyExistingChannel) {
          return handleErrors(channelAlreadyExistsError(), res);
        }

        const channel = new Channel({
          name: 'private channel',
          isGroup: false,
          members: [
            {
              userId: currentUser._id,
              isAdm: false,
            },
            {
              userId: otherUser._id,
              isAdm: false,
            },
          ],
        });

        const channelRecord = (await channel.save()) as IChannelDoc;
        const channelJson = channel.toChatChannel();

        const io = IoService.instance();

        await io.emit(IO_PRIVATE_CHANNEL_CREATED, channelJson);

        return res.status(201).json({
          message: req.t(CHANNEL_CREATED),
          channelId: channelRecord._id,
        });
      } catch (err) {
        return handleErrors(err as Error, res);
      }
    },
  },
  group: {
    async store(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
      const {
        name,
        members: membersIds,
        admins: adminsIds,
      } = req.body as IStoreGroupChannelRequestBody;
      const currentUser = req.currentUser as IUserDoc;

      try {
        const membersRecords = await User.find(
          { _id: { $in: membersIds } },
          { nickname: 1 },
        );

        if (
          !membersRecords ||
          membersRecords.length < MIN_GROUP_CHANNEL_MEMBERS
        ) {
          return handleErrors(groupHasTooFewMembersError(), res);
        }

        const adminsIdsObj = {} as { [id: string]: boolean };
        adminsIds.forEach(id => {
          adminsIdsObj[id] = true;
        });

        const members = membersIds.map(id => ({
          userId: id,
          isAdm: !!adminsIdsObj[id],
        }));

        const channel = new Channel({
          name,
          isGroup: true,
          members: [
            {
              userId: currentUser._id,
              isAdm: true,
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
            channelId: channelRecord._id,
            body: `${currentUser.nickname} added ${member.nickname}`,
            type: MESSAGE_TYPES.TEXT,
          });

          if (adminsIdsObj[memberId])
            newAdminsMessages.push({
              channelId: channelRecord._id,
              body: `${member.nickname} is now an Admin`,
              type: MESSAGE_TYPES.TEXT,
            });
        });

        const messages = [...newMembersMessages, ...newAdminsMessages];
        const messagesRecord = await insertManyMessages(messages);

        const latestMessage = messagesRecord[messagesRecord.length - 1];
        const channelJson = channelRecord.toChatChannel();
        channelJson.lastMessage = latestMessage.toChatMessage();
        channelJson.unreadMsgs = messages.length;

        await io.emit(IO_GROUP_CHANNEL_CREATED, channelJson);

        return res.status(201).json({
          message: req.t(CHANNEL_CREATED),
          channelId: channelJson._id,
        });
      } catch (err) {
        return handleErrors(err as Error, res);
      }
    },
    async update(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
      const { channelId } =
        req.params as unknown as IUpdateGroupChannelRequestParams;
      const {
        name,
        members: membersIds,
        admins: adminsIds,
      } = req.body as IUpdateGroupChannelRequestBody;
      const currentUser = req.currentUser as IUserDoc;

      try {
        const channel = await Channel.findOne({ _id: channelId });
        if (!channel || !channel.isGroup) {
          return handleErrors(cantUpdateThisGroupChannelError(), res);
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
          if (currentUser._id.toString() === member.userId.toString()) {
            members.push(member);
            isCurrentUserAdm = member.isAdm;

            delete membersIdsObj[member.userId];
            delete adminsIdsObj[member.userId];
          } else if (membersIdsObj[member.userId]) {
            const oldIsAdm = member.isAdm;
            const newIsAdm = !!adminsIdsObj[member.userId];
            if (oldIsAdm !== newIsAdm) {
              if (!newIsAdm) removedAdmins.push(member.userId);
              else newAdmins.push(member.userId);
            }

            member.isAdm = newIsAdm;
            members.push(member);

            delete membersIdsObj[member.userId];
            delete adminsIdsObj[member.userId];
          } else {
            removedMembers.push(member.userId);
          }
        }

        if (!isCurrentUserAdm) {
          return handleErrors(userIsNotGroupAdmError(), res);
        }

        Object.keys(membersIdsObj).forEach(id => {
          members.push({
            userId: id,
            isAdm: !!adminsIdsObj[id],
          });
          newMembers.push(id);
          if (adminsIdsObj[id]) newAdmins.push(id);
        });

        // PS: - 1 cause of the user that is already updating this group
        const updatedMembersCount =
          (await User.countDocuments({
            _id: { $in: members.map(member => member.userId) },
          })) - 1;
        if (
          !updatedMembersCount ||
          updatedMembersCount < MIN_GROUP_CHANNEL_MEMBERS
        ) {
          return handleErrors(groupHasTooFewMembersError(), res);
        }

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
            channelId: channel?._id,
            body: `${currentUser.nickname} added ${membersRecordsObj[id]}`,
            type: MESSAGE_TYPES.TEXT,
          });
        });
        removedMembers.forEach(id => {
          messages.push({
            channelId: channel?._id,
            body: `${currentUser.nickname} removed ${membersRecordsObj[id]}`,
            type: MESSAGE_TYPES.TEXT,
          });
        });
        newAdmins.forEach(id => {
          messages.push({
            channelId: channel?._id,
            body: `${membersRecordsObj[id]} is now an Admin`,
            type: MESSAGE_TYPES.TEXT,
          });
        });
        removedAdmins.forEach(id => {
          messages.push({
            channelId: channel?._id,
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
          message: req.t(CHANNEL_UPDATED),
          channelId: channelJson._id,
        });
      } catch (err) {
        return handleErrors(err as Error, res);
      }
    },
    async leave(req: IAuthRequest, res: Response): Promise<Response<unknown>> {
      const { channelId } =
        req.params as unknown as ILeaveGroupChannelRequestParams;
      const currentUser = req.currentUser as IUserDoc;
      const userId = currentUser._id.toString();

      try {
        const channel = await Channel.findOne({ _id: channelId });

        if (!channel || !channel.isGroup) {
          return handleErrors(cantLeaveThisChannelError(), res);
        }

        let hasOtherAdm = false;
        let memberId = '';
        let memberIsAdm = false;
        channel.members.forEach(m => {
          if (!memberId && m.userId.toString() === userId) {
            memberIsAdm = m.isAdm;
            memberId = m._id;
          } else if (m.isAdm) {
            hasOtherAdm = true;
          }
        });

        if (!memberId) {
          return handleErrors(notMemberOfGroupError(), res);
        }

        channel.members.pull(memberId);

        if (channel.members.length === 1) {
          const channelJson = channel.toChatChannel();

          await channel.delete();

          const io = IoService.instance();
          await io.emit(IO_REMOVED_FROM_GROUP_CHANNEL, {
            channel: channelJson,
            members: [userId],
          });
        } else {
          const newAdmins: IMemberDoc[] = [];
          if (memberIsAdm && !hasOtherAdm) {
            channel.members.forEach(m => {
              /* eslint-disable no-param-reassign */
              m.isAdm = true;
              newAdmins.push(m._id);
            });
          }

          const message = new Message({
            channelId,
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
          message: req.t(REMOVED_FROM_GROUP),
        });
      } catch (err) {
        return handleErrors(err as Error, res);
      }
    },
  },
};

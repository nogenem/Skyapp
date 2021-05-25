import { Response } from 'express';

import { CHANNEL_CREATED } from '~/constants/return_messages';
import { IO_PRIVATE_CHANNEL_CREATED } from '~/constants/socket_events';
import IoController from '~/IoController';
import type { IAuthRequest } from '~/middlewares/auth';
import { Channel, IChannelDoc, IUserDoc, User } from '~/models';
import { channelAlreadyExistsError, invalidIdError } from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';

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
};

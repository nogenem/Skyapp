import { Response } from 'express';

import {
  USER_STATUS_CHANGED,
  USER_THOUGHTS_CHANGED,
} from '~/constants/return_messages';
import type { TUserStatus } from '~/constants/user_status';
import type { IAuthRequest } from '~/middlewares/auth';
import { User, IUserDoc } from '~/models';
import handleErrors from '~/utils/handleErrors';

interface IChangeStatusCredentials {
  newStatus: TUserStatus;
}

interface IChangeThoughtsCredentials {
  newThoughts: string;
}

export default {
  async changeStatus(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { newStatus } = req.body as IChangeStatusCredentials;
    const user = req.currentUser as IUserDoc;

    try {
      if (user.status !== newStatus) {
        await User.updateOne({ _id: user._id }, { status: newStatus });

        // TODO: Broadcast the change

        return res.status(200).json({
          message: req.t(USER_STATUS_CHANGED),
        });
      }

      return res.status(304).json({});
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async changeThoughts(
    req: IAuthRequest,
    res: Response,
  ): Promise<Response<unknown>> {
    const { newThoughts } = req.body as IChangeThoughtsCredentials;
    const user = req.currentUser as IUserDoc;

    try {
      if (user.thoughts !== newThoughts) {
        await User.updateOne({ _id: user._id }, { thoughts: newThoughts });

        // TODO: Broadcast the change

        return res.status(200).json({
          message: req.t(USER_THOUGHTS_CHANGED),
        });
      }

      return res.status(304).json({});
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
};

export type { IChangeStatusCredentials, IChangeThoughtsCredentials };

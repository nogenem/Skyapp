import { Response } from 'express';

import {
  USER_STATUS_CHANGED,
  USER_THOUGHTS_CHANGED,
} from '~/constants/return_messages';
import type { TUserStatus } from '~/constants/user_status';
import type { IAuthRequest } from '~/middlewares/auth';
import { IUserDoc } from '~/models/User';
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
        user.status = newStatus;
        await user.save();

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
        user.thoughts = newThoughts;
        await user.save();

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

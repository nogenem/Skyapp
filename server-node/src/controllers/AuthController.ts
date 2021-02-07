import { Request, Response } from 'express';

import { USER_CREATED } from '~/constants/return_messages';
import { User } from '~/models';
import handleErrors from '~/utils/handleErrors';

export default {
  async signup(req: Request, res: Response): Promise<Response<unknown>> {
    const { nickname, email, password } = req.body;

    const user = new User({ nickname, email, password });
    user.updatePasswordHash();

    try {
      const userRecord = await user.save();
      return res.status(201).json({
        message: USER_CREATED,
        user: userRecord.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err, res);
    }
  },
};

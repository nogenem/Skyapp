import { Request, Response } from 'express';

import { USER_CREATED } from '~/constants/return_messages';
import { sendConfirmationEmail } from '~/mailer';
import { User } from '~/models';
import getHostName from '~/utils/getHostName';
import handleErrors from '~/utils/handleErrors';

export default {
  async signUp(req: Request, res: Response): Promise<Response<unknown>> {
    const { nickname, email, password } = req.body;

    const host = getHostName(req.headers);
    const user = new User({ nickname, email, password });
    user.updatePasswordHash();
    user.setConfirmationToken();

    try {
      const userRecord = await user.save();
      sendConfirmationEmail(userRecord, host);
      return res.status(201).json({
        message: USER_CREATED,
        user: userRecord.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err, res);
    }
  },
};

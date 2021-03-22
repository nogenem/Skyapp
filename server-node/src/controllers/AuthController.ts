import { Request, Response } from 'express';

import { USER_CREATED, SIGNIN_SUCCESS } from '~/constants/return_messages';
import { sendConfirmationEmail } from '~/mailer';
import { User } from '~/models';
import { invalidCredentialsError } from '~/utils/errors';
import getHostName from '~/utils/getHostName';
import handleErrors from '~/utils/handleErrors';

interface ISignUpCredentials {
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface ISignInCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default {
  async signUp(req: Request, res: Response): Promise<Response<unknown>> {
    const { nickname, email, password } = req.body as ISignUpCredentials;

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
  async signIn(req: Request, res: Response): Promise<Response<unknown>> {
    const { email, password, rememberMe } = req.body as ISignInCredentials;

    try {
      const user = await User.findOne({ email });
      if (user && user.isValidPassword(password)) {
        return res.status(200).json({
          message: SIGNIN_SUCCESS,
          user: user.toAuthJSON(!rememberMe),
        });
      }

      return handleErrors(invalidCredentialsError(), res);
    } catch (err) {
      return handleErrors(err, res);
    }
  },
};

export type { ISignInCredentials, ISignUpCredentials };

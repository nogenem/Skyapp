import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  USER_CREATED,
  SIGNIN_SUCCESS,
  ACC_CONFIRMED,
  CONFIRMATION_EMAIL_WAS_RESEND,
  TOKEN_IS_VALID,
} from '~/constants/return_messages';
import { sendConfirmationEmail } from '~/mailer';
import { User } from '~/models';
import {
  invalidCredentialsError,
  invalidOrExpiredTokenError,
} from '~/utils/errors';
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

interface ITokenCredentials {
  token: string;
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
  async confirmation(req: Request, res: Response): Promise<Response<unknown>> {
    const { token } = req.body as ITokenCredentials;

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }

    try {
      const user = await User.findOneAndUpdate(
        { confirmationToken: token },
        { confirmationToken: '', confirmed: true },
        { new: true },
      );

      if (user) {
        return res.json({
          message: ACC_CONFIRMED,
          user: user.toAuthJSON(),
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(err, res);
    }
  },
  async resendConfirmationEmail(
    req: Request,
    res: Response,
  ): Promise<Response<unknown>> {
    const { token } = req.body as ITokenCredentials;
    const host = getHostName(req.headers);

    try {
      const user = await User.findOne({ confirmationToken: token });

      if (user) {
        user.setConfirmationToken();

        const userRecord = await user.save();
        sendConfirmationEmail(userRecord, host);
        return res.status(200).json({
          message: CONFIRMATION_EMAIL_WAS_RESEND,
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(err, res);
    }
  },
  async validateToken(req: Request, res: Response): Promise<Response<unknown>> {
    const { token } = req.body as ITokenCredentials;

    try {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET) as Record<
        string,
        unknown
      >;
      delete decodedData.iat;

      return res.status(200).json({
        message: TOKEN_IS_VALID,
        decodedData,
      });
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }
  },
};

export type { ISignInCredentials, ISignUpCredentials, ITokenCredentials };

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  USER_CREATED,
  SIGNIN_SUCCESS,
  ACC_CONFIRMED,
  CONFIRMATION_EMAIL_WAS_RESEND,
  TOKEN_IS_VALID,
  RESET_PASSWORD_EMAIL_SENT,
  PASSWORD_CHANGED,
} from '~/constants/return_messages';
import { IO_NEW_USER } from '~/constants/socket_events';
import IoController from '~/IoController';
import { sendConfirmationEmail, sendResetPasswordEmail } from '~/mailer';
import { User } from '~/models';
import { ITokenData } from '~/models/User';
import {
  invalidCredentialsError,
  invalidOrExpiredTokenError,
  noUserWithSuchEmailError,
  lastEmailSentIsStillValidError,
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

interface IForgotPasswordCredentials {
  email: string;
}

interface IResetPasswordCredentials {
  token: string;
  newPassword: string;
  newPasswordConfirmation: string;
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
        message: req.t(USER_CREATED),
        user: userRecord.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async signIn(req: Request, res: Response): Promise<Response<unknown>> {
    const { email, password, rememberMe } = req.body as ISignInCredentials;

    try {
      const user = await User.findOne({ email });
      if (user && user.isValidPassword(password)) {
        return res.status(200).json({
          message: req.t(SIGNIN_SUCCESS),
          user: user.toAuthJSON(undefined, !rememberMe),
        });
      }

      return handleErrors(invalidCredentialsError(), res);
    } catch (err) {
      return handleErrors(err as Error, res);
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
        const io = IoController.instance();
        const newUser = user.toChatUser();
        newUser.online = true;

        await io.emit(IO_NEW_USER, newUser);

        return res.json({
          message: req.t(ACC_CONFIRMED),
          user: user.toAuthJSON(),
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(err as Error, res);
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
        let isValidToken = true;
        try {
          jwt.verify(user.confirmationToken as string, process.env.JWT_SECRET);
        } catch (err) {
          isValidToken = false;
        }

        if (isValidToken)
          return handleErrors(lastEmailSentIsStillValidError(), res);

        user.setConfirmationToken();

        const userRecord = await user.save();
        sendConfirmationEmail(userRecord, host);
        return res.status(200).json({
          message: req.t(CONFIRMATION_EMAIL_WAS_RESEND),
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async validateToken(req: Request, res: Response): Promise<Response<unknown>> {
    const { token } = req.body as ITokenCredentials;

    try {
      const { _id } = jwt.verify(token, process.env.JWT_SECRET) as ITokenData;
      const user = await User.findOne({ _id });

      if (user) {
        return res.status(200).json({
          message: req.t(TOKEN_IS_VALID),
          user: user.toAuthJSON(token),
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }
  },
  async forgotPassword(
    req: Request,
    res: Response,
  ): Promise<Response<unknown>> {
    const { email } = req.body as IForgotPasswordCredentials;
    const host = getHostName(req.headers);

    try {
      const user = await User.findOne({ email });

      if (user) {
        if (user.resetPasswordToken) {
          let isValidToken = true;
          try {
            jwt.verify(user.resetPasswordToken, process.env.JWT_SECRET);
          } catch (err) {
            isValidToken = false;
          }

          if (isValidToken)
            return handleErrors(lastEmailSentIsStillValidError(), res);
        }

        user.setResetPasswordToken();

        const userRecord = await user.save();
        sendResetPasswordEmail(userRecord, host);
        return res.status(200).json({
          message: req.t(RESET_PASSWORD_EMAIL_SENT),
        });
      }

      return handleErrors(noUserWithSuchEmailError(), res);
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async resetPassword(req: Request, res: Response): Promise<Response<unknown>> {
    const { newPassword, token } = req.body as IResetPasswordCredentials;

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }

    try {
      const user = await User.findOne({ resetPasswordToken: token });

      if (user) {
        user.updatePasswordHash(newPassword);
        user.resetPasswordToken = '';
        const userRecord = await user.save();

        return res.status(200).json({
          message: req.t(PASSWORD_CHANGED),
          user: userRecord.toAuthJSON(),
        });
      }

      return handleErrors(invalidOrExpiredTokenError(), res);
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
};

export type {
  ISignInCredentials,
  ISignUpCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
};

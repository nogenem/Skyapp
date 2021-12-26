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
import { User } from '~/models';
import type { ITokenData } from '~/models/User';
import type {
  IConfirmationRequestBody,
  IForgotPasswordRequestBody,
  IResendConfirmationRequestBody,
  IResetPasswordRequestBody,
  ISignInRequestBody,
  ISignUpRequestBody,
  IValidateTokenRequestBody,
} from '~/requestsParts/auth';
import { IoService, MailService } from '~/services';
import {
  invalidCredentialsError,
  invalidOrExpiredTokenError,
  noUserWithSuchEmailError,
  lastEmailSentIsStillValidError,
} from '~/utils/errors';
import getHostName from '~/utils/getHostName';
import handleErrors from '~/utils/handleErrors';

export default {
  async signUp(req: Request, res: Response): Promise<Response<unknown>> {
    const { nickname, email, password } = req.body as ISignUpRequestBody;

    const host = getHostName(req.headers);
    const user = new User({ nickname, email, password });
    user.updatePasswordHash();
    user.setConfirmationToken();

    try {
      const userRecord = await user.save();
      MailService.sendConfirmationEmail(userRecord, host);
      return res.status(201).json({
        message: req.t(USER_CREATED),
        user: userRecord.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async signIn(req: Request, res: Response): Promise<Response<unknown>> {
    const { email, password, rememberMe } = req.body as ISignInRequestBody;

    try {
      const user = await User.findOne({ email });
      if (!user || !user.isValidPassword(password)) {
        return handleErrors(invalidCredentialsError(), res);
      }

      return res.status(200).json({
        message: req.t(SIGNIN_SUCCESS),
        user: user.toAuthJSON(undefined, !rememberMe),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async confirmation(req: Request, res: Response): Promise<Response<unknown>> {
    const { token } = req.body as IConfirmationRequestBody;

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
      if (!user) {
        return handleErrors(invalidOrExpiredTokenError(), res);
      }

      const io = IoService.instance();
      const newUser = user.toChatUser();
      newUser.online = true;

      await io.emit(IO_NEW_USER, newUser);

      return res.json({
        message: req.t(ACC_CONFIRMED),
        user: user.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async resendConfirmationEmail(
    req: Request,
    res: Response,
  ): Promise<Response<unknown>> {
    const { token } = req.body as IResendConfirmationRequestBody;
    const host = getHostName(req.headers);

    try {
      const user = await User.findOne({ confirmationToken: token });
      if (!user) {
        return handleErrors(invalidOrExpiredTokenError(), res);
      }

      try {
        jwt.verify(user.confirmationToken as string, process.env.JWT_SECRET);
        return handleErrors(lastEmailSentIsStillValidError(), res);
      } catch (err) {
        //
      }

      user.setConfirmationToken();

      const userRecord = await user.save();
      MailService.sendConfirmationEmail(userRecord, host);
      return res.status(200).json({
        message: req.t(CONFIRMATION_EMAIL_WAS_RESEND),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async validateToken(req: Request, res: Response): Promise<Response<unknown>> {
    const { token } = req.body as IValidateTokenRequestBody;

    try {
      const { _id } = jwt.verify(token, process.env.JWT_SECRET) as ITokenData;

      const user = await User.findOne({ _id });
      if (!user) {
        return handleErrors(invalidOrExpiredTokenError(), res);
      }

      return res.status(200).json({
        message: req.t(TOKEN_IS_VALID),
        user: user.toAuthJSON(token),
      });
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }
  },
  async forgotPassword(
    req: Request,
    res: Response,
  ): Promise<Response<unknown>> {
    const { email } = req.body as IForgotPasswordRequestBody;
    const host = getHostName(req.headers);

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return handleErrors(noUserWithSuchEmailError(), res);
      }

      if (user.resetPasswordToken) {
        try {
          jwt.verify(user.resetPasswordToken, process.env.JWT_SECRET);
          return handleErrors(lastEmailSentIsStillValidError(), res);
        } catch (err) {
          //
        }
      }

      user.setResetPasswordToken();

      const userRecord = await user.save();
      MailService.sendResetPasswordEmail(userRecord, host);
      return res.status(200).json({
        message: req.t(RESET_PASSWORD_EMAIL_SENT),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
  async resetPassword(req: Request, res: Response): Promise<Response<unknown>> {
    const { newPassword, token } = req.body as IResetPasswordRequestBody;

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return handleErrors(invalidOrExpiredTokenError(), res);
    }

    try {
      const user = await User.findOne({ resetPasswordToken: token });
      if (!user) {
        return handleErrors(invalidOrExpiredTokenError(), res);
      }

      user.updatePasswordHash(newPassword);
      user.resetPasswordToken = '';
      const userRecord = await user.save();

      return res.status(200).json({
        message: req.t(PASSWORD_CHANGED),
        user: userRecord.toAuthJSON(),
      });
    } catch (err) {
      return handleErrors(err as Error, res);
    }
  },
};

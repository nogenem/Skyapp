import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import User, { ITokenData } from '~/models/User';
import type { IUserDoc } from '~/models/User';
import { invalidOrExpiredTokenError, noTokenError } from '~/utils/errors';
import handleErrors from '~/utils/handleErrors';

interface IAuthRequest extends Request {
  currentUser?: IUserDoc;
}

const auth: RequestHandler = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  let token;

  // eslint-disable-next-line prefer-destructuring
  if (header) token = header.split(' ')[1];

  if (token) {
    try {
      const { _id } = jwt.verify(token, process.env.JWT_SECRET) as ITokenData;
      const user = await User.findOne(
        { _id },
        { nickname: 1, email: 1, confirmed: 1 },
      );
      if (!user) return handleErrors(invalidOrExpiredTokenError(), res);

      req.currentUser = user;
      return next();
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') console.error(err);
      return handleErrors(invalidOrExpiredTokenError(), res);
    }
  } else {
    return handleErrors(noTokenError(), res);
  }
};

export default auth;
export type { IAuthRequest };

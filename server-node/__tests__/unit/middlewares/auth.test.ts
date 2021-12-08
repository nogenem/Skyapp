import { Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import auth from '~/middlewares/auth';
import type { IAuthRequest } from '~/middlewares/auth';
import type { IUserDoc } from '~/models';
import { invalidOrExpiredTokenError, noTokenError } from '~/utils/errors';
import * as handleErrors from '~/utils/handleErrors';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const VALID_TOKEN = '123456789';
const INVALID_TOKEN = '123456789_';
const INVALID_USER_ID = 'null';

describe('Confirmation', () => {
  setupDB();

  it('should call `next` and set `req.currentUser` when token is valid', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User');

    const req = {
      headers: {
        authorization: `Bearer ${VALID_TOKEN}`,
      },
    } as IAuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    jest.spyOn(jsonwebtoken, 'verify').mockImplementationOnce(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });
    jest.spyOn(handleErrors, 'default').mockImplementationOnce(() => {
      return res;
    });

    await auth(req, res, next);

    expect(req.currentUser).toBeTruthy();
    expect(next).toHaveBeenCalled();
  });

  it('should return `noTokenError` when no token is provided in the headers', async () => {
    const req = {
      headers: {},
    } as IAuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    const spy = jest
      .spyOn(handleErrors, 'default')
      .mockImplementationOnce(() => {
        return res;
      });

    await auth(req, res, next);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(noTokenError(), res);
  });

  it('should return `invalidOrExpiredTokenError` when token in headers is invalid', async () => {
    const user: IUserDoc = await factory.create<IUserDoc>('User', {});

    const req = {
      headers: {
        authorization: `Bearer ${INVALID_TOKEN}`,
      },
    } as IAuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    jest.spyOn(jsonwebtoken, 'verify').mockImplementationOnce(token => {
      if (token === VALID_TOKEN) return { _id: user._id };
      throw new Error();
    });
    const spy = jest
      .spyOn(handleErrors, 'default')
      .mockImplementationOnce(() => {
        return res;
      });

    await auth(req, res, next);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(invalidOrExpiredTokenError(), res);
  });

  it('should return `invalidOrExpiredTokenError` when the decoded token is invalid', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${VALID_TOKEN}`,
      },
    } as IAuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    jest.spyOn(jsonwebtoken, 'verify').mockImplementationOnce(token => {
      if (token === VALID_TOKEN) return { _id: INVALID_USER_ID };
      throw new Error();
    });
    const spy = jest
      .spyOn(handleErrors, 'default')
      .mockImplementationOnce(() => {
        return res;
      });

    await auth(req, res, next);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(invalidOrExpiredTokenError(), res);
  });
});

import {
  INTERNAL_SERVER_ERROR,
  INVALID_ID,
  ROUTE_NOT_FOUND_ERROR,
  INVALID_CREDENTIALS,
  INVALID_EXPIRED_TOKEN,
  NO_USER_WITH_SUCH_EMAIL,
  LAST_EMAIL_SENT_IS_STILL_VALID,
} from '../constants/error_messages';

interface IMsgObj<T> {
  [x: string]: T;
}
type TMsgObjTypes = string[] | string;
export type { IMsgObj, TMsgObjTypes };

export class CustomError extends Error {
  msgObj: IMsgObj<TMsgObjTypes>;

  kind: string;

  status: number;

  constructor(msgObj: IMsgObj<TMsgObjTypes>, status = 400) {
    super(JSON.stringify(msgObj, null, 2));

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.msgObj = msgObj;
    this.kind = 'CustomError';
    this.status = status;
  }
}

export const validatorErrors = (errs: IMsgObj<TMsgObjTypes>): CustomError =>
  new CustomError(errs);

export const internalServerError = (): CustomError =>
  new CustomError({ global: INTERNAL_SERVER_ERROR }, 500);

export const invalidIdError = (): CustomError =>
  new CustomError({ global: INVALID_ID });

export const mongooseErrors = (errs: IMsgObj<string>): CustomError =>
  new CustomError(errs);

export const routeNotFoundError = (): CustomError =>
  new CustomError({ global: ROUTE_NOT_FOUND_ERROR }, 404);

export const invalidCredentialsError = (): CustomError =>
  new CustomError({ global: INVALID_CREDENTIALS });

export const invalidOrExpiredTokenError = (): CustomError =>
  new CustomError({ global: INVALID_EXPIRED_TOKEN });

export const noUserWithSuchEmailError = (): CustomError =>
  new CustomError({ email: NO_USER_WITH_SUCH_EMAIL });

export const lastEmailSentIsStillValidError = (): CustomError =>
  new CustomError({ email: LAST_EMAIL_SENT_IS_STILL_VALID });

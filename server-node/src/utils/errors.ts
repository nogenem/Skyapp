import {
  INTERNAL_SERVER_ERROR,
  INVALID_ID,
  ROUTE_NOT_FOUND_ERROR,
  INVALID_CREDENTIALS,
  INVALID_EXPIRED_TOKEN,
  NO_USER_WITH_SUCH_EMAIL,
  LAST_EMAIL_SENT_IS_STILL_VALID,
  NO_TOKEN,
  CHANNEL_ALREADY_EXISTS,
  USER_IS_NOT_GROUP_ADM,
  NOT_MEMBER_OF_CHANNEL,
  CANT_EDIT_THIS_MESSAGE,
  groupHasTooFewMembers,
  CANT_UPDATE_THIS_GROUP_CHANNEL,
  CANT_LEAVE_THIS_CHANNEL,
  CANT_DELETE_THIS_MESSAGE,
} from '~/constants/error_messages';
import type { TTranslatableError } from '~/constants/error_messages';
import { MIN_GROUP_CHANNEL_MEMBERS } from '~/constants/validation_limits';

interface IMsgObj<T> {
  [x: string]: T;
}
type TMsgObjTypes =
  | (string | TTranslatableError)[]
  | string
  | TTranslatableError;

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

export const noTokenError = (): CustomError =>
  new CustomError({ global: NO_TOKEN });

export const channelAlreadyExistsError = (): CustomError =>
  new CustomError({ global: CHANNEL_ALREADY_EXISTS });

export const userIsNotGroupAdmError = (): CustomError =>
  new CustomError({ global: USER_IS_NOT_GROUP_ADM });

export const notMemberOfChannelError = (): CustomError =>
  new CustomError({ global: NOT_MEMBER_OF_CHANNEL });

export const multerErrors = (
  errs: [msgObj: IMsgObj<TMsgObjTypes>, status?: number],
): CustomError => new CustomError(...errs);

export const cantEditThisMessageError = (): CustomError =>
  new CustomError({ global: CANT_EDIT_THIS_MESSAGE });

export const groupHasTooFewMembersError = (): CustomError =>
  new CustomError({ global: groupHasTooFewMembers(MIN_GROUP_CHANNEL_MEMBERS) });

export const cantUpdateThisGroupChannelError = (): CustomError =>
  new CustomError({ global: CANT_UPDATE_THIS_GROUP_CHANNEL });

export const cantLeaveThisChannelError = (): CustomError =>
  new CustomError({ global: CANT_LEAVE_THIS_CHANNEL });

export const cantDeleteThisMessageError = (): CustomError =>
  new CustomError({ global: CANT_DELETE_THIS_MESSAGE });

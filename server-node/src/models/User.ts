/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { EMAIL_ALREADY_TAKEN } from '~/constants/error_messages';
import { USER_STATUS } from '~/constants/user_status';

const SALT = 10;
const TOKEN_EXPIRES_IN = '2 hours';
const USER_STATUS_VALUES = Object.values(USER_STATUS);

// https://hackernoon.com/how-to-link-mongoose-and-typescript-for-a-single-source-of-truth-94o3uqc
// https://stackoverflow.com/questions/50614345/property-virtual-does-not-exist-on-type-typeof-schema
interface IUser {
  nickname: string;
  email: string;
  passwordHash: string;

  status: number;
  thoughts: string;
  confirmed: boolean;
  confirmationToken: string;
  resetPasswordToken: string;

  // virtual
  password?: string;
  virtualPassword?: string;
  passwordConfirmation?: string;
  virtualPasswordConfirmation?: string;
}

interface IAuthUser {
  _id: string;
  nickname: string;
  email: string;

  confirmed: boolean;
  status: number;
  thoughts: string;

  token: string;
}

interface ITokenData {
  _id: string;
}

interface IChatUser {
  _id: string;
  nickname: string;
  thoughts: string;
  status: number;
  online: boolean;
  channel_id?: string;
}

interface IUserDoc extends IUser, Document {
  // My methods
  isValidPassword: (password: string) => boolean;
  updatePasswordHash: (password?: string) => void;
  toAuthJSON: (token?: string, tokenExpires?: boolean) => IAuthUser;
  setConfirmationToken: () => void;
  generateJWT: (tokenExpires?: boolean) => string;
  generateConfirmationUrl: (host: string) => string;
  setResetPasswordToken: () => void;
  generateResetPasswordUrl: (host: string) => string;
  toChatUser: () => IChatUser;
}

interface IUserModel extends Model<IUserDoc> {
  toChatUser: (user?: IUserDoc | IChatUser) => IChatUser | undefined;
}

const User = new mongoose.Schema<IUserDoc>(
  {
    nickname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    passwordHash: { type: String, required: true, toJSON: false },

    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
    resetPasswordToken: { type: String, default: '' },
    status: {
      type: Number,
      default: USER_STATUS.ACTIVE,
      enum: USER_STATUS_VALUES,
    },
    thoughts: { type: String, default: '' },
  },
  { timestamps: true },
);

User.virtual('password')
  .get(function getPassword(this: IUser) {
    return this.virtualPassword;
  })
  .set(function setPassword(this: IUser, password: string) {
    this.virtualPassword = password;
  });

User.virtual('passwordConfirmation')
  .get(function getPasswordConfirmation(this: IUser) {
    return this.virtualPasswordConfirmation;
  })
  .set(function setPasswordConfirmation(
    this: IUser,
    passwordConfirmation: string,
  ) {
    this.virtualPasswordConfirmation = passwordConfirmation;
  });

User.method('isValidPassword', function isValidPassword(password: string) {
  return bcrypt.compareSync(password, this.passwordHash);
});

User.method(
  'updatePasswordHash',
  function updatePasswordHash(password: string) {
    const pass = password || this.virtualPassword;
    if (pass) this.passwordHash = bcrypt.hashSync(pass, SALT);
  },
);

User.method(
  'toAuthJSON',
  function toAuthJSON(token = undefined, tokenExpires = true) {
    return {
      _id: this._id,
      nickname: this.nickname,
      email: this.email,
      confirmed: !!this.confirmed,
      status: this.status,
      thoughts: this.thoughts,
      token: token || this.generateJWT(tokenExpires),
    };
  },
);

User.method('generateJWT', function generateJWT(tokenExpires = true) {
  return jwt.sign(
    {
      _id: this._id.toString(),
    } as ITokenData,
    process.env.JWT_SECRET,
    tokenExpires
      ? {
          expiresIn: TOKEN_EXPIRES_IN,
        }
      : {},
  );
});

User.method('setConfirmationToken', function setConfirmationToken() {
  this.confirmationToken = this.generateJWT(true);
});

User.method(
  'generateConfirmationUrl',
  function generateConfirmationUrl(host: string) {
    return `${host}/confirmation/${this.confirmationToken}`;
  },
);

User.method('setResetPasswordToken', function setResetPasswordToken() {
  this.resetPasswordToken = this.generateJWT(true);
});

User.method(
  'generateResetPasswordUrl',
  function generateResetPasswordUrl(host: string) {
    return `${host}/reset_password/${this.resetPasswordToken}`;
  },
);

function toChatUser(user: IUserDoc | IChatUser): IChatUser {
  const oldChatUser = user as IChatUser;
  return {
    _id: user._id.toString(),
    nickname: user.nickname,
    thoughts: user.thoughts,
    status: user.status,
    online: oldChatUser.online || false,
    channel_id: oldChatUser.channel_id || undefined,
  };
}

User.static(
  'toChatUser',
  function staticToChatUser(user?: IUserDoc | IChatUser) {
    if (!user) return undefined;
    return toChatUser(user);
  },
);

User.method('toChatUser', function modelToChatUser() {
  return toChatUser(this);
});

User.plugin(
  (schema, options) => {
    const convertedSchema = schema as unknown as mongoose.Schema;
    return uniqueValidator(convertedSchema, options);
  },
  { message: EMAIL_ALREADY_TAKEN },
);

export type { IUser, IUserDoc, IAuthUser, ITokenData, IChatUser };
export default mongoose.model<IUserDoc, IUserModel>('User', User);

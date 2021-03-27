import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Document } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { EMAIL_ALREADY_TAKEN } from '~/constants/error_messages';

const SALT = 10;
const TOKEN_EXPIRES_IN = '2 hours';

// https://hackernoon.com/how-to-link-mongoose-and-typescript-for-a-single-source-of-truth-94o3uqc
// https://stackoverflow.com/questions/50614345/property-virtual-does-not-exist-on-type-typeof-schema
interface IUser {
  nickname: string;
  email: string;
  passwordHash: string;

  confirmed?: boolean;
  confirmationToken?: string;
  resetPasswordToken?: string;

  // virtual
  password?: string;
  virtualPassword?: string;
  passwordConfirmation?: string;
  virtualPasswordConfirmation?: string;
}

interface IUserDoc extends IUser, Document {
  // My methods
  isValidPassword: (password: string) => boolean;
  updatePasswordHash: (password?: string) => void;
  toAuthJSON: (tokenExpires?: boolean) => Partial<IUser>;
  setConfirmationToken: () => void;
  generateJWT: (tokenExpires?: boolean) => string;
  generateConfirmationUrl: (host: string) => string;
  setResetPasswordToken: () => void;
  generateResetPasswordUrl: (host: string) => string;
}

const schema = new mongoose.Schema<IUserDoc>(
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
  },
  { timestamps: true },
);

schema
  .virtual('password')
  .get(function getPassword(this: IUser) {
    return this.virtualPassword;
  })
  .set(function setPassword(this: IUser, password: string) {
    this.virtualPassword = password;
  });

schema
  .virtual('passwordConfirmation')
  .get(function getPasswordConfirmation(this: IUser) {
    return this.virtualPasswordConfirmation;
  })
  .set(function setPasswordConfirmation(
    this: IUser,
    passwordConfirmation: string,
  ) {
    this.virtualPasswordConfirmation = passwordConfirmation;
  });

schema.method('isValidPassword', function isValidPassword(password: string) {
  return bcrypt.compareSync(password, this.passwordHash);
});

schema.method(
  'updatePasswordHash',
  function updatePasswordHash(password: string) {
    const pass = password || this.virtualPassword;
    if (pass) this.passwordHash = bcrypt.hashSync(pass, SALT);
  },
);

schema.method('toAuthJSON', function toAuthJSON(tokenExpires = true) {
  return {
    _id: this._id,
    nickname: this.nickname,
    email: this.email,
    confirmed: this.confirmed,
    token: this.generateJWT(tokenExpires),
  };
});

schema.method('generateJWT', function generateJWT(tokenExpires = true) {
  return jwt.sign(
    {
      _id: this._id,
      nickname: this.nickname,
      email: this.email,
      confirmed: this.confirmed,
    },
    process.env.JWT_SECRET,
    tokenExpires
      ? {
          expiresIn: TOKEN_EXPIRES_IN,
        }
      : {},
  );
});

schema.method('setConfirmationToken', function setConfirmationToken() {
  this.confirmationToken = this.generateJWT(true);
});

schema.method(
  'generateConfirmationUrl',
  function generateConfirmationUrl(host: string) {
    return `${host}/confirmation/${this.confirmationToken}`;
  },
);

schema.method('setResetPasswordToken', function setResetPasswordToken() {
  this.resetPasswordToken = this.generateJWT(true);
});

schema.method(
  'generateResetPasswordUrl',
  function generateResetPasswordUrl(host: string) {
    return `${host}/reset_password/${this.resetPasswordToken}`;
  },
);

schema.plugin(uniqueValidator, { message: EMAIL_ALREADY_TAKEN });

export type { IUser, IUserDoc };
export default mongoose.model<IUserDoc>('User', schema);

import bcrypt from 'bcryptjs';
import mongoose, { Document } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { EMAIL_ALREADY_TAKEN } from '~/constants/error_messages';

const SALT = 10;

// https://hackernoon.com/how-to-link-mongoose-and-typescript-for-a-single-source-of-truth-94o3uqc
// https://stackoverflow.com/questions/50614345/property-virtual-does-not-exist-on-type-typeof-schema
interface IUser {
  nickname: string;
  email: string;
  passwordHash: string;

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
  toAuthJSON: () => Partial<IUser>;
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

schema.method('toAuthJSON', function toAuthJSON() {
  return {
    _id: this._id,
    nickname: this.nickname,
    email: this.email,
  };
});

schema.plugin(uniqueValidator, { message: EMAIL_ALREADY_TAKEN });

export type { IUser, IUserDoc };
export default mongoose.model<IUserDoc>('User', schema);

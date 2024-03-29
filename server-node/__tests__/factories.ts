/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { factory } from 'factory-girl';
import faker from 'faker';
import { Types } from 'mongoose';

import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
import {
  User,
  Message,
  IAttachment,
  Channel,
  IMemberDoc,
  IMember,
} from '~/models';
import type { IUser, IMessage, IChannel } from '~/models';

interface IUserBuildOpts {
  password: string;
}

factory.define('User', User, (opts: Partial<IUserBuildOpts> = {}): IUser => {
  const pass = opts.password || faker.internet.password();
  return {
    nickname: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: pass,

    confirmed: Math.random() < 0.5,
    status: faker.helpers.randomize(Object.values(USER_STATUS)),
    thoughts: faker.lorem.sentence(),
    confirmationToken: '',
    resetPasswordToken: '',

    // virtual
    password: pass,
    passwordConfirmation: pass,
  };
});

const attachmentFactory = (override?: Partial<IAttachment>): IAttachment => ({
  originalName: faker.system.commonFileName(),
  size: faker.datatype.number({ min: 500, max: 5000 }),
  path: faker.system.filePath(),
  mimeType: faker.system.mimeType(),
  imageDimensions:
    Math.random() < 0.5
      ? undefined
      : {
          width: faker.datatype.number({ min: 100, max: 500 }),
          height: faker.datatype.number({ min: 100, max: 500 }),
        },
  ...override,
});

class MemberObject {
  userId: string;

  isAdm: boolean;

  lastSeen: Date;

  constructor(values: IMember) {
    this.userId = values.userId;
    this.isAdm = values.isAdm;
    this.lastSeen = values.lastSeen;
  }

  save() {
    //
  }

  destroy() {
    //
  }
}

factory.define('Member', MemberObject, {
  userId: factory.assoc('User', '_id', { confirmed: true }),
  isAdm: Math.random() < 0.5,
  lastSeen: () => new Date(),
});

interface IChannelBuildOpts {
  membersLen: number;
}

factory.define(
  'Channel',
  Channel,
  (opts: Partial<IChannelBuildOpts> = {}): IChannel => {
    let membersLen = faker.datatype.number({ min: 2, max: 3 });
    if (opts?.membersLen !== undefined && opts.membersLen >= 0) {
      membersLen = opts.membersLen;
    }

    const isGroup = membersLen > 2;

    return {
      name: faker.lorem.words(),
      members: factory.assocMany(
        'Member',
        membersLen,
      ) as Types.DocumentArray<IMemberDoc>,
      isGroup,
    };
  },
);

factory.define('Message', Message, (): IMessage => {
  const isTextMessage = Math.random() < 0.5;

  const messageType = isTextMessage
    ? MESSAGE_TYPES.TEXT
    : MESSAGE_TYPES.UPLOADED_FILE;

  let body: string | IAttachment = '';
  if (isTextMessage) body = faker.lorem.paragraph();
  else body = attachmentFactory();

  const fromId = Math.random() < 0.2 ? undefined : factory.assoc('User', '_id');

  return {
    body,
    type: messageType,
    channelId: factory.assoc('Channel', '_id'),
    fromId,
  };
});

export { attachmentFactory };
export default factory;

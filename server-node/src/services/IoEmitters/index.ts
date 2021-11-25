import * as SOCKET_EVENTS from '~/constants/socket_events';

import groupChannelCreated from './groupChannelCreated';
import groupChannelUpdated from './groupChannelUpdated';
import messageDeleted from './messageDeleted';
import messageEdited from './messageEdited';
import messagesReceived from './messagesReceived';
import newUser from './newUser';
import privateChannelCreated from './privateChannelCreated';
import removedFromGroupChannel from './removedFromGroupChannel';
import setLastSeen from './setLastSeen';
import type { TSocketEvent, TEmitterFunc } from './types';
import userStatusChanged from './userStatusChanged';
import userThoughtsChanged from './userThoughtsChanged';

const emitters = {
  [SOCKET_EVENTS.IO_PRIVATE_CHANNEL_CREATED]: privateChannelCreated,
  [SOCKET_EVENTS.IO_GROUP_CHANNEL_CREATED]: groupChannelCreated,
  [SOCKET_EVENTS.IO_REMOVED_FROM_GROUP_CHANNEL]: removedFromGroupChannel,
  [SOCKET_EVENTS.IO_GROUP_CHANNEL_UPDATED]: groupChannelUpdated,
  [SOCKET_EVENTS.IO_MESSAGES_RECEIVED]: messagesReceived,
  [SOCKET_EVENTS.IO_NEW_USER]: newUser,
  [SOCKET_EVENTS.IO_SET_LAST_SEEN]: setLastSeen,
  [SOCKET_EVENTS.IO_USER_STATUS_CHANGED]: userStatusChanged,
  [SOCKET_EVENTS.IO_USER_THOUGHTS_CHANGED]: userThoughtsChanged,
  [SOCKET_EVENTS.IO_MESSAGE_EDITED]: messageEdited,
  [SOCKET_EVENTS.IO_MESSAGE_DELETED]: messageDeleted,
} as {
  [event in TSocketEvent]: TEmitterFunc | undefined;
};

export default emitters;

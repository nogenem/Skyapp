import { Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import type {
  IChannelDoc,
  IChatChannel,
  IChatMessage,
  IChatUser,
} from '~/models';
import type { IClientMap } from '~/typescript-declarations/io.d';

type TSocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

interface IMessagesReceived {
  channel: IChatChannel;
  messages: IChatMessage[];
}

interface IRemovedFromGroupChannel {
  channel: IChatChannel;
  members: string[];
}

interface ISetLastSeen {
  channel: IChatChannel;
  currentUserId: string;
  lastSeen: Date;
}

interface IUserStatusChanged {
  userId: string;
  newStatus: TUserStatus;
}

interface IUserThoughtsChanged {
  userId: string;
  newThoughts: string;
}

interface IMessageEdited {
  channel: IChatChannel;
  message: IChatMessage;
}

interface IMessageRemoved {
  channel: IChatChannel;
  message: IChatMessage;
  lastMessage?: IChatMessage;
}

type TSocketEventData =
  | IChannelDoc
  | IChatChannel
  | IMessagesReceived
  | IRemovedFromGroupChannel
  | IChatUser
  | ISetLastSeen
  | IUserStatusChanged
  | IUserThoughtsChanged
  | IMessageEdited
  | IMessageRemoved;

type TEmitterFunc = (
  io: Namespace,
  clients: IClientMap,
  eventData: TSocketEventData,
) => Promise<void>;

export type {
  TSocketEvent,
  IMessagesReceived,
  IRemovedFromGroupChannel,
  TSocketEventData,
  TEmitterFunc,
  ISetLastSeen,
  IUserStatusChanged,
  IUserThoughtsChanged,
  IMessageEdited,
  IMessageRemoved,
};

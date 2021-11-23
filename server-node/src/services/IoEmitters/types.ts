/* eslint-disable camelcase */
import { Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import { IChannelDoc, IChatChannel, IChatMessage, IChatUser } from '~/models';
import { IClientMap } from '~/typescript-declarations/io.d';

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
  user_id: string;
  newStatus: TUserStatus;
}

interface IUserThoughtsChanged {
  user_id: string;
  newThoughts: string;
}

interface IMessageEdited {
  channel: IChatChannel;
  message: IChatMessage;
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
  | IMessageEdited;

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
};

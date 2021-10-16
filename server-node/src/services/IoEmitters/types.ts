import { Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';
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

type TSocketEventData =
  | IChannelDoc
  | IChatChannel
  | IMessagesReceived
  | IRemovedFromGroupChannel
  | IChatUser;

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
};

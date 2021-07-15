import { Server as HttpServer } from 'http';
import { Server as SocketServer, Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { IClientInfo, IClientMap } from '~/typescript-declarations/io.d';
import getUsersAndChannelsData from '~/utils/getUsersAndChannelsData';

import {
  IChannelDoc,
  IChatChannel,
  IChatMessage,
  IChatUser,
  Message,
} from './models';

interface IMessagesReceived {
  channel: IChatChannel;
  messages: IChatMessage[];
}

interface IRemovedFromGroupChannel {
  channel: IChatChannel;
  members: string[];
}

type TSocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
type TSocketEventData =
  | IChannelDoc
  | IChatChannel
  | IMessagesReceived
  | IRemovedFromGroupChannel
  | IChatUser;

class IoController {
  _io: SocketServer | null;

  _clients: IClientMap;

  static _instance: IoController;

  private constructor() {
    this._io = null;
    this._clients = {};
  }

  static instance(reset = false): IoController {
    if (reset || !IoController._instance)
      IoController._instance = new IoController();
    return IoController._instance;
  }

  init({
    httpServer,
    port,
    socketServer,
  }: {
    httpServer?: HttpServer;
    port?: number;
    socketServer?: SocketServer;
  }): void {
    const configs = {
      cors: {
        origin: '*',
        methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
      },
    };
    if (httpServer) {
      this._io = new SocketServer(httpServer, configs);
    } else if (port) {
      this._io = new SocketServer(port, configs);
    } else if (socketServer) {
      this._io = socketServer;
    } else {
      throw new Error('>> You need to pass at least one param!');
    }
    this._initEvents();
  }

  getIo(): Namespace | null {
    if (!this._io) return null;
    return this._io.of(process.env.IO_NAMESPACE);
  }

  getClient(userId: string): IClientInfo {
    return this._clients[userId];
  }

  async emit(event: TSocketEvent, eventData: TSocketEventData): Promise<void> {
    const io = this.getIo();

    if (!io) return;

    switch (event) {
      case SOCKET_EVENTS.IO_PRIVATE_CHANNEL_CREATED: {
        const channel = eventData as IChannelDoc;
        const channelJson = channel.toChatChannel();

        channelJson.members.forEach((member, idx) => {
          const otherMemberIdx = idx === 0 ? 1 : 0;
          const thisMemberClient = this._clients[member.user_id];

          if (thisMemberClient) {
            io.to(thisMemberClient.socketId).emit(event, {
              ...channelJson,
              other_member_idx: otherMemberIdx,
            });
          }
        });
        break;
      }
      case SOCKET_EVENTS.IO_GROUP_CHANNEL_CREATED: {
        const channelJson = eventData as IChatChannel;

        channelJson.members.forEach(member => {
          const thisMemberClient = this._clients[member.user_id];
          if (thisMemberClient) {
            io.to(thisMemberClient.socketId).emit(event, channelJson);
          }
        });
        break;
      }
      case SOCKET_EVENTS.IO_REMOVED_FROM_GROUP_CHANNEL: {
        const { channel, members } = eventData as IRemovedFromGroupChannel;
        members.forEach(id => {
          const thisMemberClient = this._clients[id];
          if (thisMemberClient) {
            io.to(thisMemberClient.socketId).emit(event, {
              channelId: channel._id,
            });
          }
        });
        break;
      }
      case SOCKET_EVENTS.IO_GROUP_CHANNEL_UPDATED: {
        const channelJson = eventData as IChatChannel;

        channelJson.members.forEach(async member => {
          const thisMemberClient = this._clients[member.user_id];
          if (thisMemberClient) {
            const unreadMsgs = await Message.countDocuments({
              channel_id: channelJson._id,
              updatedAt: { $gt: member.last_seen },
            });
            channelJson.unread_msgs = unreadMsgs;

            io.to(thisMemberClient.socketId).emit(event, channelJson);
          }
        });
        break;
      }
      case SOCKET_EVENTS.IO_MESSAGES_RECEIVED: {
        const { channel, messages } = eventData as IMessagesReceived;
        channel.members.forEach(member => {
          const thisMemberClient = this._clients[member.user_id];
          if (thisMemberClient) {
            io.to(thisMemberClient.socketId).emit(event, messages);
          }
        });
        break;
      }
      case SOCKET_EVENTS.IO_NEW_USER: {
        const newUser = eventData as IChatUser;
        Object.values(this._clients).forEach(({ socketId }) => {
          io.to(socketId).emit(event, newUser);
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  _initEvents(): boolean {
    const io = this.getIo();

    if (!io) return false;

    io.on(SOCKET_EVENTS.SOCKET_CONNECT, socket => {
      if (process.env.NODE_ENV !== 'test')
        console.log('connection: ', socket.id);
      let currentUserId = '';

      if (socket.handshake.query && socket.handshake.query._id) {
        currentUserId = socket.handshake.query._id as string;
        this._clients[currentUserId] = {
          socketId: socket.id,
        };

        socket.join(currentUserId);
        socket.broadcast.emit(SOCKET_EVENTS.IO_SIGNIN, currentUserId);
      }

      socket.on(SOCKET_EVENTS.IO_GET_INITIAL_DATA, async fn => {
        const data = await getUsersAndChannelsData(
          currentUserId,
          this._clients,
        );
        fn(data);
      });

      socket.on(SOCKET_EVENTS.SOCKET_DISCONNECT, () => {
        socket.broadcast.emit(SOCKET_EVENTS.IO_SIGNOUT, currentUserId);

        if (this._clients[currentUserId]) {
          delete this._clients[currentUserId];
        }

        currentUserId = '';
      });
    });
    return true;
  }

  close(): void {
    if (this._io) this._io.close();
  }
}

export default IoController;

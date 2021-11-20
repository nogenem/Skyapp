import { Server as HttpServer } from 'http';
import { Server as SocketServer, Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { Channel } from '~/models';
import { IClientInfo, IClientMap } from '~/typescript-declarations/io.d';
import getUsersAndChannelsData from '~/utils/getUsersAndChannelsData';

import IO_EMITTERS from './IoEmitters';
import type { TSocketEvent, TSocketEventData } from './IoEmitters/types';

class IoService {
  _io: SocketServer | null;

  _clients: IClientMap;

  static _instance: IoService;

  private constructor() {
    this._io = null;
    this._clients = {};
  }

  static instance(reset = false): IoService {
    if (reset || !IoService._instance) IoService._instance = new IoService();
    return IoService._instance;
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
    const emitter = IO_EMITTERS[event];

    if (!io || !emitter) return;

    await emitter(io, this._clients, eventData);
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
          currentChannelId: undefined,
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

      socket.on(
        SOCKET_EVENTS.IO_SET_ACTIVE_CHANNEL,
        async ({
          channel_id: channelId,
        }: {
          // eslint-disable-next-line camelcase
          channel_id: string | undefined;
        }) => {
          const lastSeen = new Date();

          // update the last channel that the user was in
          if (this._clients[currentUserId].currentChannelId !== undefined) {
            await Channel.updateOne(
              {
                _id: this._clients[currentUserId].currentChannelId,
                'members.user_id': currentUserId,
              },
              { 'members.$.last_seen': lastSeen },
            );
          }

          this._clients[currentUserId].currentChannelId = channelId;

          if (channelId !== undefined) {
            // update the new channel that the user is entering
            const channel = await Channel.findOneAndUpdate(
              { _id: channelId, 'members.user_id': currentUserId },
              { 'members.$.last_seen': lastSeen },
              { new: true },
            );

            if (channel) {
              const channelJson = channel.toChatChannel();

              this.emit(SOCKET_EVENTS.IO_SET_LAST_SEEN, {
                channel: channelJson,
                currentUserId,
                lastSeen,
              });
            }
          }
        },
      );
    });
    return true;
  }

  close(): void {
    if (this._io) this._io.close();
  }
}

export default IoService;

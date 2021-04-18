import { Server as HttpServer } from 'http';
import { Server as SocketServer, Namespace } from 'socket.io';

import * as SOCKET_EVENTS from '~/constants/socket_events';

interface IClientInfo {
  socketId: string;
}
interface IClientMap {
  [userId: string]: IClientInfo;
}

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
    if (httpServer) {
      this._io = new SocketServer(httpServer);
    } else if (port) {
      this._io = new SocketServer(port);
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

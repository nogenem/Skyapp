import { io as ioClient, Socket } from 'socket.io-client';

class IoService {
  _socket: Socket | null;

  static _instance: IoService;

  private constructor() {
    this._socket = null;
  }

  static instance(reset = false): IoService {
    if (reset || !IoService._instance) IoService._instance = new IoService();
    return IoService._instance;
  }

  connect(query = {}) {
    if (this._socket && this._socket.connected) return false;

    const url = process.env.REACT_APP_SOCKET_URL as string;
    this._socket = ioClient(url, {
      query,
    });
    return true;
  }

  disconnect() {
    if (this._socket && this._socket.connected) {
      this._socket.off();
      this._socket.disconnect();
    }
  }

  get socket() {
    return this._socket;
  }
}

export default IoService;

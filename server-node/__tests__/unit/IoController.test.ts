/* eslint-disable jest/no-done-callback */
import { Socket as ServerSocket, Namespace } from 'socket.io';
import { io as ioClient, Socket as SocketClient } from 'socket.io-client';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import IoController from '~/IoController';
import { IUserDoc } from '~/models';

import factory from '../factories';
import { setupDB } from '../test-setup';

const PORT = process.env.PORT_FOR_TESTS || 5010;
describe('IoController', () => {
  setupDB();

  let userIds: string[];
  let sockets: SocketClient[];
  let ioServer: IoController;

  beforeAll(() => {
    ioServer = IoController.instance(true);
    ioServer.init({ port: PORT });
  });

  afterAll(() => {
    ioServer.close();
  });

  beforeEach(async () => {
    userIds = [
      (await factory.create<IUserDoc>('User'))._id.toString(),
      (await factory.create<IUserDoc>('User'))._id.toString(),
    ];

    const url = `http://localhost:${PORT}${process.env.IO_NAMESPACE}`;
    const socket1 = ioClient(url, {
      reconnectionDelay: 0,
      // forceNew: true,
      transports: ['websocket'],
      autoConnect: false,
      query: {
        _id: userIds[0],
      },
    });
    const socket2 = ioClient(url, {
      reconnectionDelay: 0,
      // forceNew: true,
      transports: ['websocket'],
      autoConnect: false,
      query: {
        _id: userIds[1],
      },
    });

    sockets = [socket1, socket2];
  });

  afterEach(() => {
    sockets.forEach(socket => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    });
  });

  it('Should be able to connect', done => {
    expect.assertions(3);
    let assertions = 0;

    const onSocket0Connect = () => {
      const io = ioServer.getIo() as Namespace;
      const { rooms } = io.sockets.get(sockets[0].id) as ServerSocket;

      expect(rooms.has(userIds[0])).toBe(true);
      assertions++;
      expect(ioServer.getClient(userIds[0])).toBeTruthy();
      assertions++;

      if (assertions === 3) done();
    };

    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[1].on(SOCKET_EVENTS.IO_SIGNIN, (data: string) => {
        expect(data).toBe(userIds[0]);
        assertions++;

        if (assertions === 3) done();
      });

      sockets[0].open();
      sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, onSocket0Connect);
    });
  });

  it('Should be able to disconnect', done => {
    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[1].on(SOCKET_EVENTS.IO_SIGNOUT, (data: string) => {
        expect(data).toBe(userIds[0]);
        expect(ioServer.getClient(userIds[0])).toBeFalsy();

        done();
      });

      sockets[0].open();
      sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
        sockets[0].disconnect();
      });
    });
  });
});

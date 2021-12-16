/* eslint-disable jest/no-done-callback */
import { Types } from 'mongoose';
import { Socket as ServerSocket, Namespace } from 'socket.io';
import { io as ioClient, Socket as SocketClient } from 'socket.io-client';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { USER_STATUS } from '~/constants/user_status';
import type { TUserStatus } from '~/constants/user_status';
import { Channel, IChannelDoc, IMemberDoc, IUserDoc, User } from '~/models';
import { IoService } from '~/services';
import { IInitialData } from '~/utils/getUsersAndChannelsData';
import factory from '~t/factories';
import { setupDB } from '~t/test-setup';

const PORT = process.env.PORT_FOR_TESTS || 5010;
describe('IoService', () => {
  setupDB();

  let userIds: string[];
  let sockets: SocketClient[];
  let ioServer: IoService;

  beforeAll(() => {
    ioServer = IoService.instance(true);
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
    const N_ASSERTIONS = 3;
    expect.assertions(N_ASSERTIONS);
    let assertions = 0;

    const onSocket0Connect = () => {
      const io = ioServer.getIo() as Namespace;
      const { rooms } = io.sockets.get(sockets[0].id) as ServerSocket;

      expect(rooms.has(userIds[0])).toBe(true);
      assertions++;
      expect(ioServer.getClient(userIds[0])).toBeTruthy();
      assertions++;

      if (assertions === N_ASSERTIONS) done();
    };

    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[1].on(SOCKET_EVENTS.IO_SIGNIN, (data: string) => {
        expect(data).toBe(userIds[0]);
        assertions++;

        if (assertions === N_ASSERTIONS) done();
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

  it('should be able to handle `IO_GET_INITIAL_DATA`', done => {
    sockets[0].open();

    sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[0].emit(
        SOCKET_EVENTS.IO_GET_INITIAL_DATA,
        (data: IInitialData) => {
          expect(data.users).toBeTruthy();
          expect(data.channels).toBeTruthy();

          done();
        },
      );
    });
  });

  it('should be able to handle `IO_SET_ACTIVE_CHANNEL`', async done => {
    const oldLastSeen = new Date('2021-12-09T12:36:34.768Z');
    const member1 = await factory.create<IMemberDoc>('Member', {
      userId: userIds[0],
      lastSeen: oldLastSeen,
    });
    const member2 = await factory.create<IMemberDoc>('Member', {
      userId: userIds[1],
      lastSeen: oldLastSeen,
    });
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        members: new Types.DocumentArray([member1, member2]),
      },
      { membersLen: 2 },
    );

    sockets[0].open();

    sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[0].on(SOCKET_EVENTS.IO_SET_LAST_SEEN, async data => {
        expect(data.channelId).toBe(channel._id.toString());
        expect(data.userId).toBe(userIds[1]);
        expect(data.lastSeen).toBeTruthy();

        const client = ioServer.getClient(userIds[1]);
        expect(client.currentChannelId).toBe(channel._id.toString());

        const updatedChannel = (await Channel.findOne({
          _id: channel._id,
        })) as IChannelDoc;

        expect(updatedChannel.members[1].lastSeen).not.toBe(oldLastSeen);

        done();
      });
    });

    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, async () => {
      sockets[1].emit(SOCKET_EVENTS.IO_SET_ACTIVE_CHANNEL, {
        channelId: channel._id,
      });
    });
  });

  it('should be able to handle `IO_SET_LAST_SEEN`', async done => {
    const oldLastSeen = new Date('2021-12-09T12:36:34.768Z');
    const member1 = await factory.create<IMemberDoc>('Member', {
      userId: userIds[0],
      lastSeen: oldLastSeen,
    });
    const member2 = await factory.create<IMemberDoc>('Member', {
      userId: userIds[1],
      lastSeen: oldLastSeen,
    });
    const channel = await factory.create<IChannelDoc>(
      'Channel',
      {
        members: new Types.DocumentArray([member1, member2]),
      },
      { membersLen: 2 },
    );

    sockets[0].open();

    sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[0].on(SOCKET_EVENTS.IO_SET_LAST_SEEN, async data => {
        expect(data.channelId).toBe(channel._id.toString());
        expect(data.userId).toBe(userIds[1]);
        expect(data.lastSeen).toBeTruthy();

        const updatedChannel = (await Channel.findOne({
          _id: channel._id,
        })) as IChannelDoc;

        expect(updatedChannel.members[1].lastSeen).not.toBe(oldLastSeen);

        done();
      });
    });

    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, async () => {
      sockets[1].emit(SOCKET_EVENTS.IO_SET_LAST_SEEN, {
        channelId: channel._id,
      });
    });
  });

  it('should be able to handle `IO_USER_STATUS_CHANGED`', async done => {
    const user1Status = (await User.findOne({ _id: userIds[1] }, { status: 1 }))
      ?.status as TUserStatus;
    const newStatus: TUserStatus = Object.values(USER_STATUS).filter(
      status => status !== user1Status,
    )[0];

    sockets[0].open();

    sockets[0].on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
      sockets[0].on(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, async data => {
        expect(data.userId).toBe(userIds[1]);
        expect(data.newStatus).toBe(newStatus);
        done();
      });
    });

    sockets[1].open();

    sockets[1].on(SOCKET_EVENTS.SOCKET_CONNECT, async () => {
      sockets[1].emit(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, {
        newStatus,
      });
    });
  });
});

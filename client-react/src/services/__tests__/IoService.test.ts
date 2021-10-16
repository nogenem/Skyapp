import { setupFakeSocket } from '~/utils/testUtils';

import IoService from '../IoService';

jest.mock('socket.io-client');

describe('IoService', () => {
  const fakeSocket = setupFakeSocket();

  let ioServer: IoService;

  beforeEach(() => {
    ioServer = IoService.instance(true);
  });

  afterEach(() => {
    ioServer.disconnect();

    jest.restoreAllMocks();
  });

  it('should be able to connect', () => {
    ioServer.connect();

    expect(fakeSocket.mockedIoClient).toHaveBeenCalledTimes(1);
    expect(fakeSocket.mockedIoClient).toHaveBeenCalledWith(
      process.env.REACT_APP_SOCKET_URL,
      expect.any(Object),
    );
    expect(ioServer.socket!.connected).toBe(true);
  });

  it('should be able to disconnect', () => {
    ioServer.connect();

    ioServer.disconnect();

    expect(ioServer.socket!.connected).toBe(false);
  });
});

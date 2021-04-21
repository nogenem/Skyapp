import { setupFakeSocket } from '~/utils/testUtils';

import io from '../io';

jest.mock('socket.io-client');

describe('io', () => {
  const fakeSocket = setupFakeSocket();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to connect', () => {
    const instance = io.instance();
    instance.connect();

    expect(fakeSocket.mockedIoClient).toHaveBeenCalledTimes(1);
    expect(fakeSocket.mockedIoClient).toHaveBeenCalledWith(
      process.env.REACT_APP_SOCKET_URL,
      expect.any(Object),
    );
    expect(instance!.socket!.connected).toBe(true);
  });

  it('should be able to disconnect', () => {
    const instance = io.instance();
    instance.connect();

    instance.disconnect();

    expect(instance!.socket!.connected).toBe(false);
  });
});

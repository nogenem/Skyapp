import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { io as ioClient } from 'socket.io-client';
import MockedServerSocket from 'socket.io-mock';

import type { IAppState } from '~/redux/store';
import {
  SocketMock,
  SocketClient,
} from '~/typescript-declarations/socketio-mock';

export const getMockStore = () => {
  const middlewares = [thunk];
  return configureStore(middlewares);
};

export const getRenderWithRedux = () => {
  const emptyState: Partial<IAppState> = {};
  const mockStore = getMockStore();

  return (
    ui: React.ReactNode,
    initialState: Partial<IAppState> = emptyState,
  ) => {
    const store = mockStore(initialState);
    return {
      ...render(<Provider store={store}>{ui}</Provider>),
    };
  };
};

// https://github.com/SupremeTechnopriest/socket.io-mock/issues/14
interface IFakeSocketReturn {
  server: SocketMock | null;
  socket: SocketClient | null;
  mockedIoClient: jest.MockedFunction<() => SocketClient>;
}
export const setupFakeSocket = () => {
  const ret: IFakeSocketReturn = {
    server: null,
    socket: null,
    mockedIoClient: ioClient as unknown as jest.MockedFunction<
      () => SocketClient
    >,
  };

  beforeEach(() => {
    ret.server = new MockedServerSocket();
    ret.socket = ret.server!.socketClient;

    ret.mockedIoClient.mockReturnValue(ret.socket);
  });

  return ret;
};

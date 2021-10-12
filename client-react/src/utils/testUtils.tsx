import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import merge from 'deepmerge';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { io as ioClient } from 'socket.io-client';
import MockedServerSocket from 'socket.io-mock';

import { USER_STATUS } from '~/constants/user_status';
import type { IAppState } from '~/redux/store';
import { initialState as userInitialState } from '~/redux/user/reducer';
import type { TUserState } from '~/redux/user/types';
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

export const FACTORIES = {
  userState: (
    override: Partial<TUserState> = {},
    options = { emptyState: false },
  ): TUserState =>
    merge(
      !!options && options.emptyState
        ? userInitialState
        : {
            _id: '1',
            nickname: 'Test User',
            email: 'test@test.com',
            confirmed: false,
            status: USER_STATUS.ACTIVE,
            thoughts: '',
            token: '123456789',
          },
      override,
    ),
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

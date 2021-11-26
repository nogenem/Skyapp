import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserState } from '~/redux/user/types';
import IoService from '~/services/IoService';
import { setupFakeSocket, getMockStore, FACTORIES } from '~/utils/testUtils';

import { userSignedIn, userSignedOut } from '../actions';

jest.mock('socket.io-client');

const mockStore = getMockStore();

describe('chat actions', () => {
  const fakeSocket = setupFakeSocket();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('userSignedIn', async () => {
    const user: TUserState = FACTORIES.userState();

    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    // Since fakeSocket does not automatically emit a connect message as socketio io() does, simulate it here.
    fakeSocket.server!.emit(SOCKET_EVENTS.SOCKET_CONNECT);

    const instance = IoService.instance();
    expect(instance!.socket!.connected).toBe(true);
  });

  it('userSignedOut', () => {
    userSignedOut()();

    const instance = IoService.instance();
    expect(instance!.socket!.connected).toBe(false);
  });
});

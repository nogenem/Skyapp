import { Socket } from 'socket.io-client';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import { USER_STATUS } from '~/constants/user_status';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import FACTORIES from '~/utils/factories';
import { getMockStore, setupFakeSocket } from '~/utils/testUtils';

import {
  userSignedIn,
  userSignedOut,
  //
  sendSignUp,
  sendSignIn,
  sendConfirmation,
  SendResendConfirmationEmail,
  sendValidateToken,
  sendForgotPassword,
  sendResetPassword,
  sendChangeStatus,
  sendChangeThoughts,
  emitUserStatusChanged,
} from '../actions';
import { EUserActions } from '../types';
import type {
  TUserAction,
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  IChangeStatusCredentials,
  IChangeThoughtsCredentials,
  IUser,
} from '../types';

jest.mock('../../../utils/setAuthorizationHeader', () => ({
  __esModule: true,
  default: () => {},
}));
jest.mock('socket.io-client');

const mockStore = getMockStore();

const VALID_TOKEN = '123456789';

describe('auth actions', () => {
  setupFakeSocket();

  let ioServer: IoService;

  beforeEach(() => {
    ioServer = IoService.instance(true);
  });

  afterEach(() => {
    ioServer.disconnect();

    jest.restoreAllMocks();
  });

  it('userSignedIn__not confirmed', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
      confirmed: false,
    });
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_TOKEN)).toBe(user.token);

    expect(ioServer.socket).toBeFalsy();
  });

  it('userSignedIn__confirmed', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
      confirmed: true,
    });
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_TOKEN)).toBe(user.token);

    expect(ioServer.socket!.connected).toBe(true);
  });

  it('userSignedOut', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
      confirmed: true,
    });
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
      { type: EUserActions.SIGNED_OUT, payload: null } as TUserAction,
    ];
    const store = mockStore({});

    userSignedIn(user)(store.dispatch);
    userSignedOut()(store.dispatch);

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_TOKEN)).toBe(null);

    expect(ioServer.socket!.connected).toBe(false);
  });

  it('sendSignUp', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const credentials: ISignUpCredentials = {
      nickname: 'test',
      email: 'test@test.com',
      password: '123456',
      passwordConfirmation: '123456',
    };

    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(ApiService.auth, 'signUp')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });
    const store = mockStore({});

    await sendSignUp(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendSignIn', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const credentials: ISignInCredentials = {
      email: 'test@test.com',
      password: '123456',
      rememberMe: false,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(ApiService.auth, 'signIn')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await sendSignIn(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendConfirmation', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(ApiService.auth, 'confirmation')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await sendConfirmation(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('SendResendConfirmationEmail', async () => {
    const message = 'success';
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const spy = jest
      .spyOn(ApiService.auth, 'resendConfirmationEmail')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await SendResendConfirmationEmail(credentials)();

    expect(spy).toHaveBeenCalledWith(credentials);
  });

  it('sendValidateToken', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(ApiService.auth, 'validateToken')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await sendValidateToken(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendForgotPassword', async () => {
    const message = 'success';
    const credentials: IForgotPasswordCredentials = {
      email: 'test@test.com',
    };
    const spy = jest
      .spyOn(ApiService.auth, 'forgotPassword')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await sendForgotPassword(credentials)();

    expect(spy).toHaveBeenCalledWith(credentials);
  });

  it('sendResetPassword', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const credentials: IResetPasswordCredentials = {
      newPassword: '123456',
      newPasswordConfirmation: '123456',
      token: VALID_TOKEN,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];

    const spy = jest
      .spyOn(ApiService.auth, 'resetPassword')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await sendResetPassword(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendChangeStatus', async () => {
    const credentials: IChangeStatusCredentials = {
      newStatus: USER_STATUS.AWAY,
    };
    const expectedActions = [
      {
        type: EUserActions.STATUS_CHANGED,
        payload: credentials.newStatus,
      } as TUserAction,
    ];

    const spy = jest
      .spyOn(ApiService.user, 'changeStatus')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message: 'success' });
      });

    const store = mockStore({});

    await sendChangeStatus(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendChangeThoughts', async () => {
    const credentials: IChangeThoughtsCredentials = {
      newThoughts: 'hello world',
    };
    const expectedActions = [
      {
        type: EUserActions.THOUGHTS_CHANGED,
        payload: credentials.newThoughts,
      } as TUserAction,
    ];

    const spy = jest
      .spyOn(ApiService.user, 'changeThoughts')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message: 'success' });
      });

    const store = mockStore({});

    await sendChangeThoughts(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('emitUserStatusChanged', () => {
    const newStatus = USER_STATUS.AWAY;

    ioServer.connect();
    const socket = ioServer.socket as Socket;

    const expectedActions = [
      {
        type: EUserActions.STATUS_CHANGED,
        payload: newStatus,
      },
    ];
    const spy = jest.spyOn(socket, 'emit').mockImplementationOnce(() => {
      return socket;
    });
    const store = mockStore({});

    emitUserStatusChanged(newStatus)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, {
      newStatus,
    });
    expect(store.getActions()).toEqual(expectedActions);
  });
});

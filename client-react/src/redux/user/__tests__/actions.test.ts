import { Socket } from 'socket.io-client';

import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import { USER_STATUS } from '~/constants/user_status';
import type {
  IConfirmationRequestBody,
  IForgotPasswordRequestBody,
  IResendConfirmationRequestBody,
  IResetPasswordRequestBody,
  ISignInRequestBody,
  ISignUpRequestBody,
  IValidateTokenRequestBody,
} from '~/requestsParts/auth';
import type {
  IChangeStatusRequestBody,
  IChangeThoughtsRequestBody,
} from '~/requestsParts/user';
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
import type { TUserAction, IUser } from '../types';

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
    const data: ISignUpRequestBody = {
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

    await sendSignUp(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendSignIn', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const data: ISignInRequestBody = {
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

    await sendSignIn(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendConfirmation', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const data: IConfirmationRequestBody = {
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

    await sendConfirmation(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('SendResendConfirmationEmail', async () => {
    const message = 'success';
    const data: IResendConfirmationRequestBody = {
      token: VALID_TOKEN,
    };
    const spy = jest
      .spyOn(ApiService.auth, 'resendConfirmationEmail')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await SendResendConfirmationEmail(data)();

    expect(spy).toHaveBeenCalledWith(data);
  });

  it('sendValidateToken', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const data: IValidateTokenRequestBody = {
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

    await sendValidateToken(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendForgotPassword', async () => {
    const message = 'success';
    const data: IForgotPasswordRequestBody = {
      email: 'test@test.com',
    };
    const spy = jest
      .spyOn(ApiService.auth, 'forgotPassword')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await sendForgotPassword(data)();

    expect(spy).toHaveBeenCalledWith(data);
  });

  it('sendResetPassword', async () => {
    const user: IUser = FACTORIES.models.user({
      token: VALID_TOKEN,
    });
    const data: IResetPasswordRequestBody = {
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

    await sendResetPassword(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendChangeStatus', async () => {
    const data: IChangeStatusRequestBody = {
      newStatus: USER_STATUS.AWAY,
    };
    const expectedActions = [
      {
        type: EUserActions.STATUS_CHANGED,
        payload: data.newStatus,
      } as TUserAction,
    ];

    const spy = jest
      .spyOn(ApiService.user, 'updateStatus')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message: 'success' });
      });

    const store = mockStore({});

    await sendChangeStatus(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendChangeThoughts', async () => {
    const data: IChangeThoughtsRequestBody = {
      newThoughts: 'hello world',
    };
    const expectedActions = [
      {
        type: EUserActions.THOUGHTS_CHANGED,
        payload: data.newThoughts,
      } as TUserAction,
    ];

    const spy = jest
      .spyOn(ApiService.user, 'updateThoughts')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message: 'success' });
      });

    const store = mockStore({});

    await sendChangeThoughts(data)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(data);
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

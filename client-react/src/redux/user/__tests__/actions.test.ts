import { LOCAL_STORAGE_TOKEN } from '~/constants/localStorageKeys';
import api from '~/services/api';
import { FACTORIES, getMockStore } from '~/utils/testUtils';

import {
  userSignedIn,
  userSignedOut,
  //
  signUp,
  signIn,
  confirmation,
  resendConfirmationEmail,
  validateToken,
  forgotPassword,
  resetPassword,
} from '../actions';
import { EUserActions } from '../types';
import type {
  TUserAction,
  ISignUpCredentials,
  ISignInCredentials,
  ITokenCredentials,
  IForgotPasswordCredentials,
  IResetPasswordCredentials,
  TUserState,
} from '../types';

jest.mock('../../../utils/setAuthorizationHeader', () => ({
  __esModule: true,
  default: () => {},
}));

const mockStore = getMockStore();

const VALID_TOKEN = '123456789';

describe('auth actions', () => {
  it('userSignedIn', async () => {
    const user: TUserState = FACTORIES.userState({
      token: VALID_TOKEN,
    });
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_TOKEN)).toBe(user.token);
  });

  it('userSignedOut', async () => {
    const user: TUserState = FACTORIES.userState({
      token: VALID_TOKEN,
    });
    const expectedActions = [{ type: EUserActions.SIGNED_OUT } as TUserAction];
    const store = mockStore({
      user,
    });
    localStorage.setItem(LOCAL_STORAGE_TOKEN, VALID_TOKEN);

    store.dispatch(userSignedOut());

    expect(store.getActions()).toEqual(expectedActions);
    expect(localStorage.getItem(LOCAL_STORAGE_TOKEN)).toBe(null);
  });

  it('signUp', async () => {
    const user: TUserState = FACTORIES.userState({
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
    const spy = jest.spyOn(api.auth, 'signUp').mockImplementationOnce(() => {
      return Promise.resolve({ user });
    });
    const store = mockStore({});

    await signUp(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('signIn', async () => {
    const user: TUserState = FACTORIES.userState({
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
    const spy = jest.spyOn(api.auth, 'signIn').mockImplementationOnce(() => {
      return Promise.resolve({ user });
    });

    const store = mockStore({});

    await signIn(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('confirmation', async () => {
    const user: TUserState = FACTORIES.userState({
      token: VALID_TOKEN,
    });
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(api.auth, 'confirmation')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await confirmation(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('resendConfirmationEmail', async () => {
    const message = 'success';
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const spy = jest
      .spyOn(api.auth, 'resendConfirmationEmail')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await resendConfirmationEmail(credentials)();

    expect(spy).toHaveBeenCalledWith(credentials);
  });

  it('validateToken', async () => {
    const user: TUserState = FACTORIES.userState({
      token: VALID_TOKEN,
    });
    const credentials: ITokenCredentials = {
      token: VALID_TOKEN,
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest
      .spyOn(api.auth, 'validateToken')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await validateToken(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('forgotPassword', async () => {
    const message = 'success';
    const credentials: IForgotPasswordCredentials = {
      email: 'test@test.com',
    };
    const spy = jest
      .spyOn(api.auth, 'forgotPassword')
      .mockImplementationOnce(() => {
        return Promise.resolve({ message });
      });

    await forgotPassword(credentials)();

    expect(spy).toHaveBeenCalledWith(credentials);
  });

  it('resetPassword', async () => {
    const user: TUserState = FACTORIES.userState({
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
      .spyOn(api.auth, 'resetPassword')
      .mockImplementationOnce(() => {
        return Promise.resolve({ user });
      });

    const store = mockStore({});

    await resetPassword(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

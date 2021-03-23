import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import api from '~/services/api';

import { userSignedIn, signUp, signIn, confirmation } from '../actions';
import { EUserActions } from '../types';
import type {
  IUser,
  TUserAction,
  ISignUpCredentials,
  ISignInCredentials,
  IConfirmationCredentials,
} from '../types';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const VALID_TOKEN = '123456789';

describe('auth actions', () => {
  it('userSignedIn', async () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
    };

    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('signUp', async () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
      token: VALID_TOKEN,
    };
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
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
      token: VALID_TOKEN,
    };
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
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
      token: VALID_TOKEN,
    };
    const credentials: IConfirmationCredentials = {
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
});

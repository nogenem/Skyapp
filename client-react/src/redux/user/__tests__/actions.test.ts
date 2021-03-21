import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import api from '~/services/api';

import { userSignedIn, signup, signin } from '../actions';
import { EUserActions } from '../types';
import type {
  IUser,
  TUserAction,
  ISignUpCredentials,
  ISignInCredentials,
} from '../types';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

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

  it('signup', async () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
      token: '123456789',
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
    const spy = jest.spyOn(api.auth, 'signup').mockImplementationOnce(() => {
      return Promise.resolve({ user });
    });
    const store = mockStore({});

    await signup(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('signin', async () => {
    const user: IUser = {
      _id: '1',
      nickname: 'test',
      email: 'test@test.com',
      confirmed: false,
      token: '123456789',
    };
    const credentials: ISignInCredentials = {
      email: 'test@test.com',
      password: '123456',
    };
    const expectedActions = [
      { type: EUserActions.SIGNED_IN, payload: user } as TUserAction,
    ];
    const spy = jest.spyOn(api.auth, 'signin').mockImplementationOnce(() => {
      return Promise.resolve({ user });
    });

    const store = mockStore({});

    await signin(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

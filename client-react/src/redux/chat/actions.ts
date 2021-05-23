import { Dispatch } from 'redux';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import io from '~/services/io';

import { IUser } from '../user/types';
import { EChatActions, IInitialData } from './types';

const setInitialData = (data: IInitialData) => ({
  type: EChatActions.SET_INITIAL_DATA,
  payload: data,
});

export const connectIo = (user: IUser) => (dispatch: Dispatch) => {
  const instance = io.instance();
  instance.connect({ _id: user._id });

  instance.socket!.on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
    instance.socket!.emit(
      SOCKET_EVENTS.IO_GET_INITIAL_DATA,
      (data: IInitialData) => {
        dispatch(setInitialData(data));
      },
    );

    instance.socket!.on(SOCKET_EVENTS.IO_SIGNIN, (_id: string) => {});
    instance.socket!.on(SOCKET_EVENTS.IO_SIGNOUT, (_id: string) => {});
  });
};

export const disconnectIo = () => (dispatch: Dispatch) => {
  io.instance().disconnect();
};

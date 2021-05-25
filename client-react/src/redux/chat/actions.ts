import { Dispatch } from 'redux';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import type { IUser } from '~/redux/user/types';
import api from '~/services/api';
import io from '~/services/io';

import type { IInitialData, IOtherUser } from './types';
import { EChatActions } from './types';

const setInitialData = (data: IInitialData) => ({
  type: EChatActions.SET_INITIAL_DATA,
  payload: data,
});

const setUserOnline = (_id: string, value: boolean) => ({
  type: EChatActions.SET_USER_ONLINE,
  payload: {
    _id,
    value,
  },
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

    instance.socket!.on(SOCKET_EVENTS.IO_SIGNIN, (_id: string) => {
      dispatch(setUserOnline(_id, true));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_SIGNOUT, (_id: string) => {
      dispatch(setUserOnline(_id, false));
    });
  });
};

export const disconnectIo = () => (dispatch: Dispatch) => {
  io.instance().disconnect();
};

export const startChattingWith = (otherUser: IOtherUser) => (
  dispatch: Dispatch,
) =>
  api.chat.createChannelWith(otherUser).then(() => {
    // TODO: Add new created channel to the state
    // TODO: Test this
  });

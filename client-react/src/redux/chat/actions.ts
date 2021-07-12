import { Dispatch } from 'redux';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import type { IUser } from '~/redux/user/types';
import api from '~/services/api';
import io from '~/services/io';

import type {
  IChannel,
  IInitialData,
  INewGroupCredentials,
  IOtherUser,
  IUpdateGroupCredentials,
} from './types';
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

const addNewChannel = (channel: IChannel) => ({
  type: EChatActions.ADD_NEW_CHANNEL,
  payload: channel,
});

export const setActiveChannel = (channel_id: string) => ({
  type: EChatActions.SET_ACTIVE_CHANNEL,
  payload: { _id: channel_id },
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
    instance.socket!.on(
      SOCKET_EVENTS.IO_PRIVATE_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(addNewChannel(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_GROUP_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(addNewChannel(channel));
      },
    );
  });
};

export const disconnectIo = () => (dispatch: Dispatch) => {
  io.instance().disconnect();
};

export const startChattingWith = (otherUser: IOtherUser) => (
  dispatch: Dispatch,
) =>
  api.chat.createChannelWith(otherUser).then(({ channel_id }) => {
    dispatch(setActiveChannel(channel_id));
  });

export const createGroupChannel = (credentials: INewGroupCredentials) => (
  dispatch: Dispatch,
) =>
  api.chat.createGroupChannel(credentials).then(({ channel_id }) => {
    dispatch(setActiveChannel(channel_id));
  });

export const updateGroupChannel = (credentials: IUpdateGroupCredentials) => (
  dispatch: Dispatch,
) =>
  api.chat.updateGroupChannel(credentials).then(({ channel_id }) => {
    dispatch(setActiveChannel(channel_id));
  });

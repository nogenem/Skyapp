import { Dispatch } from 'redux';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import type { IUser } from '~/redux/user/types';
import { ApiService, IoService } from '~/services';
import MessageQueueService, {
  QUEUE_ACTIONS,
} from '~/services/MessageQueueService';

import type {
  IChannel,
  IEditMessageCredentials,
  IFetchMessagesCredentials,
  IInitialData,
  ILeaveGroupCredentials,
  IMessage,
  INewGroupCredentials,
  IOtherUser,
  ISendMessageCredentials,
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

const addOrUpdateChannel = (channel: IChannel) => ({
  type: EChatActions.ADD_OR_UPDATE_CHANNEL,
  payload: channel,
});

const removeChannel = (channelId: string) => ({
  type: EChatActions.REMOVE_CHANNEL,
  payload: { channelId },
});

const setActiveChannel = (channel_id: string | undefined) => ({
  type: EChatActions.SET_ACTIVE_CHANNEL,
  payload: { _id: channel_id },
});

const setLastSeen = (data: {
  channel_id: string;
  user_id: string;
  last_seen: string;
}) => ({
  type: EChatActions.SET_LAST_SEEN,
  payload: data,
});

const setUserStatus = (data: { user_id: string; newStatus: TUserStatus }) => ({
  type: EChatActions.SET_USER_STATUS,
  payload: data,
});

const setUserThoughts = (data: { user_id: string; newThoughts: string }) => ({
  type: EChatActions.SET_USER_THOUGHTS,
  payload: data,
});

const addNewUser = (newUser: IOtherUser) => ({
  type: EChatActions.ADD_NEW_USER,
  payload: newUser,
});

export const addMessages = (
  messages: IMessage[],
  totalMessages: number = -1,
  atTop: boolean = false,
) => ({
  type: EChatActions.ADD_MESSAGES,
  payload: {
    messages,
    totalMessages,
    atTop,
  },
});

export const setMessageIsUpdating = (message_id: string, value: boolean) => ({
  type: EChatActions.SET_MESSAGE_IS_UPDATING,
  payload: {
    message_id,
    value,
  },
});

export const updateMessage = (message: IMessage) => ({
  type: EChatActions.UPDATE_MESSAGE,
  payload: message,
});

export const addToMessagesQueue = (message: IMessage) => ({
  type: EChatActions.ADD_TO_MESSAGES_QUEUE,
  payload: message,
});

export const removeFromMessagesQueue = (message: IMessage) => ({
  type: EChatActions.REMOVE_FROM_MESSAGES_QUEUE,
  payload: message,
});

export const connectIo = (user: IUser) => (dispatch: Dispatch) => {
  const instance = IoService.instance();
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
    instance.socket!.on(SOCKET_EVENTS.IO_NEW_USER, (newUser: IOtherUser) => {
      dispatch(addNewUser(newUser));
    });
    instance.socket!.on(
      SOCKET_EVENTS.IO_PRIVATE_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(addOrUpdateChannel(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_GROUP_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(addOrUpdateChannel(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_REMOVED_FROM_GROUP_CHANNEL,
      ({ channelId }: { channelId: string }) => {
        dispatch(removeChannel(channelId));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_GROUP_CHANNEL_UPDATED,
      (channel: IChannel) => {
        dispatch(addOrUpdateChannel(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_MESSAGES_RECEIVED,
      (messages: IMessage[]) => {
        dispatch(addMessages(messages));
      },
    );
    instance.socket!.on(SOCKET_EVENTS.IO_SET_LAST_SEEN, data => {
      dispatch(setLastSeen(data));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, data => {
      dispatch(setUserStatus(data));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_USER_THOUGHTS_CHANGED, data => {
      dispatch(setUserThoughts(data));
    });
    instance.socket!.on(
      SOCKET_EVENTS.IO_MESSAGE_EDITED,
      (message: IMessage) => {
        dispatch(updateMessage(message));
      },
    );
  });
};

export const disconnectIo = () => (dispatch: Dispatch) => {
  IoService.instance().disconnect();
};

export const startChattingWith =
  (otherUser: IOtherUser) => (dispatch: Dispatch) =>
    ApiService.chat.createChannelWith(otherUser).then(({ channel_id }) => {
      dispatch(setActiveChannel(channel_id));
    });

export const createGroupChannel =
  (credentials: INewGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.chat.createGroupChannel(credentials).then(({ channel_id }) => {
      dispatch(setActiveChannel(channel_id));
    });

export const updateGroupChannel =
  (credentials: IUpdateGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.chat.updateGroupChannel(credentials).then(({ channel_id }) => {
      dispatch(setActiveChannel(channel_id));
    });

export const leaveGroupChannel =
  (credentials: ILeaveGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.chat.leaveGroupChannel(credentials).then(() => {
      dispatch(removeChannel(credentials.channel_id));
    });

export const fetchMessages =
  (credentials: IFetchMessagesCredentials) => (dispatch: Dispatch) =>
    ApiService.chat.getMessages(credentials).then(({ docs, totalDocs }) => {
      docs.reverse();
      dispatch(addMessages(docs, totalDocs, true));
    });

export const sendMessage = (channel_id: string, message: string) => () => {
  const credentials: ISendMessageCredentials = {
    channel_id,
    body: message,
  };
  MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.SEND_TEXT_MESSAGE);
};

export const sendFiles = (filesData: FormData) => () => {
  MessageQueueService.enqueue(filesData, QUEUE_ACTIONS.SEND_FILE_MESSAGES);
};

export const sendEditMessage = (message: IMessage, newBody: string) => () => {
  const credentials: IEditMessageCredentials = {
    message,
    newBody,
  };
  MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.EDIT_TEXT_MESSAGE);
};

export const sendSetActiveChannel =
  (channel_id: string | undefined) => (dispatch: Dispatch) => {
    const instance = IoService.instance();
    instance.socket!.emit(SOCKET_EVENTS.IO_SET_ACTIVE_CHANNEL, { channel_id });

    dispatch(setActiveChannel(channel_id));
  };

export const sendSetLastSeen = (channel_id: string) => () => {
  const instance = IoService.instance();
  instance.socket!.emit(SOCKET_EVENTS.IO_SET_LAST_SEEN, { channel_id });
};

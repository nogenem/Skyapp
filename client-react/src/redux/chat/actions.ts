import { Dispatch } from 'redux';

import * as SOCKET_EVENTS from '~/constants/socket_events';
import { TUserStatus } from '~/constants/user_status';
import type { IUser } from '~/redux/user/types';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import MessageQueueService, {
  QUEUE_ACTIONS,
} from '~/services/MessageQueueService';

import type {
  IChannel,
  IDeleteMessageCredentials,
  IEditMessageCredentials,
  IFetchMessagesCredentials,
  IInitialData,
  ILeaveGroupCredentials,
  IMessage,
  INewGroupCredentials,
  IOtherUser,
  ISendFilesCredentials,
  ISendMessageCredentials,
  IUpdateGroupCredentials,
} from './types';
import { EChatActions } from './types';

const chatInitialDataLoaded = (data: IInitialData) => ({
  type: EChatActions.INITIAL_DATA_LOADED,
  payload: data,
});

const userOnlineStatusChanged = (_id: string, value: boolean) => ({
  type: EChatActions.USER_ONLINE_STATUS_CHANGED,
  payload: {
    _id,
    value,
  },
});

const channelCreatedOrUpdated = (channel: IChannel) => ({
  type: EChatActions.CHANNEL_CREATED_OR_UPDATED,
  payload: channel,
});

const userRemovedFromChannel = (channelId: string) => ({
  type: EChatActions.REMOVED_FROM_CHANNEL,
  payload: { channelId },
});

const activeChannelChanged = (channel_id: string | undefined) => ({
  type: EChatActions.ACTIVE_CHANNEL_CHANGED,
  payload: { _id: channel_id },
});

const userLastSeenChanged = (data: {
  channel_id: string;
  user_id: string;
  last_seen: string;
}) => ({
  type: EChatActions.LAST_SEEN_CHANGED,
  payload: data,
});

const userStatusChanged = (data: {
  user_id: string;
  newStatus: TUserStatus;
}) => ({
  type: EChatActions.USER_STATUS_CHANGED,
  payload: data,
});

const userThoughtsChanged = (data: {
  user_id: string;
  newThoughts: string;
}) => ({
  type: EChatActions.USER_THOUGHTS_CHANGED,
  payload: data,
});

const newUserConfirmed = (newUser: IOtherUser) => ({
  type: EChatActions.NEW_USER_CONFIRMED,
  payload: newUser,
});

export const newMessagesReceived = (
  messages: IMessage[],
  totalMessages: number = -1,
  atTop: boolean = false,
) => ({
  type: EChatActions.NEW_MESSAGES_RECEIVED,
  payload: {
    messages,
    totalMessages,
    atTop,
  },
});

export const messageIsUpdatingChanged = (
  message_id: string,
  value: boolean,
) => ({
  type: EChatActions.MESSAGE_IS_UPDATING_CHANGED,
  payload: {
    message_id,
    value,
  },
});

export const messageUpdated = (message: IMessage) => ({
  type: EChatActions.MESSAGE_UPDATED,
  payload: message,
});

export const messageIsDeletingChanged = (
  message_id: string,
  value: boolean,
) => ({
  type: EChatActions.MESSAGE_IS_DELETING_CHANGED,
  payload: {
    message_id,
    value,
  },
});

export const messageDeleted = (message: IMessage, lastMessage?: IMessage) => ({
  type: EChatActions.MESSAGE_DELETED,
  payload: { message, lastMessage },
});

export const messageEnqueued = (message: IMessage) => ({
  type: EChatActions.MESSAGE_ENQUEUED,
  payload: message,
});

export const messageDequeued = (message: IMessage) => ({
  type: EChatActions.MESSAGE_DEQUEUED,
  payload: message,
});

export const userSignedIn = (user: IUser) => (dispatch: Dispatch) => {
  const instance = IoService.instance();
  instance.connect({ _id: user._id });

  instance.socket!.on(SOCKET_EVENTS.SOCKET_CONNECT, () => {
    instance.socket!.emit(
      SOCKET_EVENTS.IO_GET_INITIAL_DATA,
      (data: IInitialData) => {
        dispatch(chatInitialDataLoaded(data));
      },
    );

    instance.socket!.on(SOCKET_EVENTS.IO_SIGNIN, (_id: string) => {
      dispatch(userOnlineStatusChanged(_id, true));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_SIGNOUT, (_id: string) => {
      dispatch(userOnlineStatusChanged(_id, false));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_NEW_USER, (newUser: IOtherUser) => {
      dispatch(newUserConfirmed(newUser));
    });
    instance.socket!.on(
      SOCKET_EVENTS.IO_PRIVATE_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(channelCreatedOrUpdated(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_GROUP_CHANNEL_CREATED,
      (channel: IChannel) => {
        dispatch(channelCreatedOrUpdated(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_REMOVED_FROM_GROUP_CHANNEL,
      ({ channelId }: { channelId: string }) => {
        dispatch(userRemovedFromChannel(channelId));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_GROUP_CHANNEL_UPDATED,
      (channel: IChannel) => {
        dispatch(channelCreatedOrUpdated(channel));
      },
    );
    instance.socket!.on(
      SOCKET_EVENTS.IO_MESSAGES_RECEIVED,
      (messages: IMessage[]) => {
        dispatch(newMessagesReceived(messages));
      },
    );
    instance.socket!.on(SOCKET_EVENTS.IO_SET_LAST_SEEN, data => {
      dispatch(userLastSeenChanged(data));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_USER_STATUS_CHANGED, data => {
      dispatch(userStatusChanged(data));
    });
    instance.socket!.on(SOCKET_EVENTS.IO_USER_THOUGHTS_CHANGED, data => {
      dispatch(userThoughtsChanged(data));
    });
    instance.socket!.on(
      SOCKET_EVENTS.IO_MESSAGE_EDITED,
      (message: IMessage) => {
        dispatch(messageUpdated(message));
      },
    );
    instance.socket!.on(SOCKET_EVENTS.IO_MESSAGE_DELETED, data => {
      const deleteData = data as { message: IMessage; lastMessage?: IMessage };
      dispatch(messageDeleted(deleteData.message, deleteData.lastMessage));
    });
  });
};

export const userSignedOut = () => () => {
  IoService.instance().disconnect();
};

export const sendCreateChannelWith =
  (otherUser: IOtherUser) => (dispatch: Dispatch) =>
    ApiService.channel.private.store(otherUser).then(({ channel_id }) => {
      dispatch(activeChannelChanged(channel_id));
    });

export const sendCreateGroupChannel =
  (credentials: INewGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.channel.group.store(credentials).then(({ channel_id }) => {
      dispatch(activeChannelChanged(channel_id));
    });

export const sendUpdateGroupChannel =
  (credentials: IUpdateGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.channel.group.update(credentials).then(({ channel_id }) => {
      dispatch(activeChannelChanged(channel_id));
    });

export const sendLeaveGroupChannel =
  (credentials: ILeaveGroupCredentials) => (dispatch: Dispatch) =>
    ApiService.channel.group.leave(credentials).then(() => {
      dispatch(userRemovedFromChannel(credentials.channel_id));
    });

export const sendGetMessages =
  (credentials: IFetchMessagesCredentials) => (dispatch: Dispatch) =>
    ApiService.message.all(credentials).then(({ docs, totalDocs }) => {
      docs.reverse();
      dispatch(newMessagesReceived(docs, totalDocs, true));
    });

export const enqueueSendTextMessage =
  (channel_id: string, message: string) => () => {
    const credentials: ISendMessageCredentials = {
      channel_id,
      body: message,
    };
    MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.SEND_TEXT_MESSAGE);
  };

export const enqueueSendFileMessages =
  (channel_id: string, filesData: FormData) => () => {
    const credentials: ISendFilesCredentials = {
      channel_id,
      files: filesData,
    };
    MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.SEND_FILE_MESSAGES);
  };

export const enqueueSendEditTextMessage =
  (message: IMessage, newBody: string) => () => {
    const credentials: IEditMessageCredentials = {
      message,
      newBody,
    };
    MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.EDIT_TEXT_MESSAGE);
  };

export const enqueueSendDeleteMessage = (message: IMessage) => () => {
  const credentials: IDeleteMessageCredentials = {
    message,
  };
  MessageQueueService.enqueue(credentials, QUEUE_ACTIONS.DELETE_MESSAGE);
};

export const emitSetActiveChannel =
  (channel_id: string | undefined) => (dispatch: Dispatch) => {
    const instance = IoService.instance();
    instance.socket!.emit(SOCKET_EVENTS.IO_SET_ACTIVE_CHANNEL, { channel_id });

    dispatch(activeChannelChanged(channel_id));
  };

export const emitSetLastSeen = (channel_id: string) => () => {
  const instance = IoService.instance();
  instance.socket!.emit(SOCKET_EVENTS.IO_SET_LAST_SEEN, { channel_id });
};

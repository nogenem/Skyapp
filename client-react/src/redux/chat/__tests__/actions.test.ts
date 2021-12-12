import { Socket } from 'socket.io-client';

import { MESSAGE_TYPES } from '~/constants/message_types';
import * as SOCKET_EVENTS from '~/constants/socket_events';
import type { IUser } from '~/redux/user/types';
import ApiService from '~/services/ApiService';
import IoService from '~/services/IoService';
import MessageQueueService, {
  QUEUE_ACTIONS,
} from '~/services/MessageQueueService';
import FACTORIES from '~/utils/factories';
import { setupFakeSocket, getMockStore } from '~/utils/testUtils';

import {
  emitSetActiveChannel,
  emitSetLastSeen,
  enqueueSendDeleteMessage,
  enqueueSendEditTextMessage,
  enqueueSendFileMessages,
  enqueueSendTextMessage,
  sendCreateChannelWith,
  sendCreateGroupChannel,
  sendGetMessages,
  sendLeaveGroupChannel,
  sendUpdateGroupChannel,
  userSignedIn,
  userSignedOut,
} from '../actions';
import {
  EChatActions,
  IDeleteMessageCredentials,
  IEditMessageCredentials,
  IFetchMessagesCredentials,
  ILeaveGroupCredentials,
  IMessage,
  INewGroupCredentials,
  IOtherUser,
  ISendFilesCredentials,
  ISendMessageCredentials,
  IUpdateGroupCredentials,
} from '../types';

jest.mock('socket.io-client');

const mockStore = getMockStore();

describe('chat actions', () => {
  const fakeSocket = setupFakeSocket();

  let ioServer: IoService;

  beforeEach(() => {
    ioServer = IoService.instance(true);
  });

  afterEach(() => {
    ioServer.disconnect();

    jest.restoreAllMocks();
  });

  it('userSignedIn', async () => {
    const user: IUser = FACTORIES.models.user();

    const store = mockStore({});

    userSignedIn(user)(store.dispatch);

    // Since fakeSocket does not automatically emit a connect message as socketio io() does, simulate it here.
    fakeSocket.server!.emit(SOCKET_EVENTS.SOCKET_CONNECT);

    expect(ioServer!.socket!.connected).toBe(true);
  });

  it('userSignedOut', () => {
    ioServer.connect();

    userSignedOut()();

    expect(ioServer!.socket!.connected).toBe(false);
  });

  it('sendCreateChannelWith', async () => {
    const channelId = '1';
    const user: IOtherUser = FACTORIES.models.otherUser();
    const apiResponse = { channel_id: channelId };

    const expectedActions = [
      {
        type: EChatActions.ACTIVE_CHANNEL_CHANGED,
        payload: { _id: apiResponse.channel_id },
      },
    ];
    const spy = jest
      .spyOn(ApiService.chat, 'createChannelWith')
      .mockImplementationOnce(() => {
        return Promise.resolve(apiResponse);
      });
    const store = mockStore({});

    await sendCreateChannelWith(user)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(user);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendCreateGroupChannel', async () => {
    const channelId = '1';
    const credentials: INewGroupCredentials = {
      name: 'Group 1',
      members: ['1', '2'],
      admins: ['1'],
    };
    const apiResponse = { channel_id: channelId };

    const expectedActions = [
      {
        type: EChatActions.ACTIVE_CHANNEL_CHANGED,
        payload: { _id: apiResponse.channel_id },
      },
    ];
    const spy = jest
      .spyOn(ApiService.chat, 'createGroupChannel')
      .mockImplementationOnce(() => {
        return Promise.resolve(apiResponse);
      });
    const store = mockStore({});

    await sendCreateGroupChannel(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendUpdateGroupChannel', async () => {
    const channelId = '1';
    const credentials: IUpdateGroupCredentials = {
      channel_id: channelId,
      name: 'Group 1',
      members: ['1', '2'],
      admins: ['1'],
    };
    const apiResponse = { channel_id: channelId };

    const expectedActions = [
      {
        type: EChatActions.ACTIVE_CHANNEL_CHANGED,
        payload: { _id: apiResponse.channel_id },
      },
    ];
    const spy = jest
      .spyOn(ApiService.chat, 'updateGroupChannel')
      .mockImplementationOnce(() => {
        return Promise.resolve(apiResponse);
      });
    const store = mockStore({});

    await sendUpdateGroupChannel(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendLeaveGroupChannel', async () => {
    const channelId = '1';
    const credentials: ILeaveGroupCredentials = {
      channel_id: channelId,
    };
    const apiResponse = { channel_id: channelId };

    const expectedActions = [
      {
        type: EChatActions.REMOVED_FROM_CHANNEL,
        payload: { channelId: apiResponse.channel_id },
      },
    ];
    const spy = jest
      .spyOn(ApiService.chat, 'leaveGroupChannel')
      .mockImplementationOnce(() => {
        return Promise.resolve(apiResponse);
      });
    const store = mockStore({});

    await sendLeaveGroupChannel(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sendGetMessages', async () => {
    const credentials: IFetchMessagesCredentials = {
      channel_id: '1',
      offset: 0,
      limit: 10,
      sort: '-createdAt',
    };
    const apiResponse = { docs: [], totalDocs: 0 };

    const expectedActions = [
      {
        type: EChatActions.NEW_MESSAGES_RECEIVED,
        payload: {
          messages: apiResponse.docs,
          totalMessages: apiResponse.totalDocs,
          atTop: true,
        },
      },
    ];
    const spy = jest
      .spyOn(ApiService.chat, 'getMessages')
      .mockImplementationOnce(() => {
        return Promise.resolve(apiResponse);
      });
    const store = mockStore({});

    await sendGetMessages(credentials)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(credentials);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('enqueueSendTextMessage', async () => {
    const channelId = '1';
    const message = 'Test Message';

    const expectedCredentials: ISendMessageCredentials = {
      channel_id: channelId,
      body: message,
    };

    const spy = jest
      .spyOn(MessageQueueService, 'enqueue')
      .mockImplementationOnce(() => {});

    await enqueueSendTextMessage(channelId, message)();

    expect(spy).toHaveBeenCalledWith(
      expectedCredentials,
      QUEUE_ACTIONS.SEND_TEXT_MESSAGE,
    );
  });

  it('enqueueSendFileMessages', async () => {
    const filesData = new FormData();
    const channelId = '1';

    const expectedCredentials: ISendFilesCredentials = {
      channel_id: channelId,
      files: filesData,
    };

    const spy = jest
      .spyOn(MessageQueueService, 'enqueue')
      .mockImplementationOnce(() => {});

    await enqueueSendFileMessages(channelId, filesData)();

    expect(spy).toHaveBeenCalledWith(
      expectedCredentials,
      QUEUE_ACTIONS.SEND_FILE_MESSAGES,
    );
  });

  it('enqueueSendEditTextMessage', async () => {
    const message: IMessage = FACTORIES.models.message({
      body: 'Test Message',
      type: MESSAGE_TYPES.TEXT,
    });
    const newBody = 'New Test Message';

    const expectedCredentials: IEditMessageCredentials = {
      message,
      newBody,
    };
    const spy = jest
      .spyOn(MessageQueueService, 'enqueue')
      .mockImplementationOnce(() => {});

    await enqueueSendEditTextMessage(message, newBody)();

    expect(spy).toHaveBeenCalledWith(
      expectedCredentials,
      QUEUE_ACTIONS.EDIT_TEXT_MESSAGE,
    );
  });

  it('enqueueSendDeleteMessage', async () => {
    const message: IMessage = FACTORIES.models.message();

    const expectedCredentials: IDeleteMessageCredentials = {
      message,
    };
    const spy = jest
      .spyOn(MessageQueueService, 'enqueue')
      .mockImplementationOnce(() => {});

    await enqueueSendDeleteMessage(message)();

    expect(spy).toHaveBeenCalledWith(
      expectedCredentials,
      QUEUE_ACTIONS.DELETE_MESSAGE,
    );
  });

  it('emitSetActiveChannel', () => {
    const channelId = '1';

    ioServer.connect();
    const socket = ioServer.socket as Socket;

    const expectedActions = [
      {
        type: EChatActions.ACTIVE_CHANNEL_CHANGED,
        payload: { _id: channelId },
      },
    ];
    const spy = jest.spyOn(socket, 'emit').mockImplementationOnce(() => {
      return socket;
    });
    const store = mockStore({});

    emitSetActiveChannel(channelId)(store.dispatch);

    expect(spy).toHaveBeenCalledWith(SOCKET_EVENTS.IO_SET_ACTIVE_CHANNEL, {
      channel_id: channelId,
    });
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('emitSetLastSeen', () => {
    const channelId = '1';

    ioServer.connect();
    const socket = ioServer.socket as Socket;

    const spy = jest.spyOn(socket, 'emit').mockImplementationOnce(() => {
      return socket;
    });

    emitSetLastSeen(channelId)();

    expect(spy).toHaveBeenCalledWith(SOCKET_EVENTS.IO_SET_LAST_SEEN, {
      channel_id: channelId,
    });
  });
});

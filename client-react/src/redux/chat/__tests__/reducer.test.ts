import { MESSAGE_TYPES } from '~/constants/message_types';
import { USER_STATUS } from '~/constants/user_status';
import { EUserActions, TUserAction } from '~/redux/user/types';

import userReducer, { initialState as reducerInitialState } from '../reducer';
import type {
  TChatAction,
  IInitialData,
  TChatState,
  IChannel,
  IOtherUser,
  IMessage,
} from '../types';
import { EChatActions } from '../types';

describe('chat reducer', () => {
  it('should handle SIGNED_OUT', () => {
    const userId = '1';
    const initialState: TChatState = {
      users: {
        [userId]: {
          _id: userId,
          nickname: 'Test',
          thoughts: '',
          status: USER_STATUS.ACTIVE,
          online: false,
        },
      },
      channels: {},
    };
    const action: TUserAction = {
      type: EUserActions.SIGNED_OUT,
      payload: null,
    };

    const newState = userReducer(initialState, action);
    expect(newState.users).toEqual(reducerInitialState.users);
    expect(newState.channels).toEqual(reducerInitialState.channels);
  });

  it('should handle INITIAL_DATA_LOADED', () => {
    const initialData: IInitialData = { users: {}, channels: {} };
    const action: TChatAction = {
      type: EChatActions.INITIAL_DATA_LOADED,
      payload: initialData,
    };

    const newState = userReducer(undefined, action);
    expect(newState.users).toEqual(action.payload.users);
    expect(newState.channels).toEqual(action.payload.channels);
  });

  it('should handle USER_ONLINE_STATUS_CHANGED', () => {
    const userId = '1';
    const initialState: TChatState = {
      users: {
        [userId]: {
          _id: userId,
          nickname: 'Test',
          thoughts: '',
          status: USER_STATUS.ACTIVE,
          online: false,
        },
      },
      channels: {},
    };

    // value = true
    let data = { _id: userId, value: true };
    let action: TChatAction = {
      type: EChatActions.USER_ONLINE_STATUS_CHANGED,
      payload: data,
    };

    let newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);

    data = { _id: userId, value: false };
    action = {
      type: EChatActions.USER_ONLINE_STATUS_CHANGED,
      payload: data,
    };

    newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);
  });

  it('should handle USER_ONLINE_STATUS_CHANGED', () => {
    const user1 = {
      _id: '1',
      nickname: 'Test 1',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };
    const user2 = {
      _id: '2',
      nickname: 'Test 2',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };
    const initialState: TChatState = {
      users: {
        [user1._id]: user1,
        [user2._id]: user2,
      },
      channels: {},
    };

    // new channel
    let channelId = 'abcdef';
    const payload1: IChannel = {
      _id: channelId,
      name: 'Channel 1',
      is_group: false,
      members: [
        {
          user_id: user1._id,
          is_adm: false,
          last_seen: new Date(),
        },
        {
          user_id: user2._id,
          is_adm: false,
          last_seen: new Date(),
        },
      ],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    let action: TChatAction = {
      type: EChatActions.CHANNEL_CREATED_OR_UPDATED,
      payload: payload1,
    };

    let newState = userReducer(initialState, action);
    expect(newState.channels[channelId]).toBeTruthy();
    expect(newState.channels[channelId].name).toEqual(user2.nickname);
    expect(newState.users[user1._id].channel_id).toEqual(channelId);
    expect(newState.users[user2._id].channel_id).toEqual(channelId);

    // update channel
    const payload2: IChannel = {
      ...payload1,
      other_member_idx: 0,
    };
    action = {
      type: EChatActions.CHANNEL_CREATED_OR_UPDATED,
      payload: payload2,
    };

    newState = userReducer(initialState, action);
    expect(newState.channels[channelId]).toBeTruthy();
    expect(newState.channels[channelId].name).toEqual(user1.nickname);
    expect(newState.users[user1._id].channel_id).toEqual(channelId);
    expect(newState.users[user2._id].channel_id).toEqual(channelId);
  });

  it('should handle ACTIVE_CHANNEL_CHANGED', () => {
    const channelId = '1';
    const channel: IChannel = {
      _id: channelId,
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 10,
    };

    // setting the activeChannel
    const initialState: TChatState = {
      users: {},
      channels: {
        [channelId]: channel,
      },
    };
    let action: TChatAction = {
      type: EChatActions.ACTIVE_CHANNEL_CHANGED,
      payload: { _id: channelId },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo).toBeTruthy();
    expect(newState.activeChannelInfo?._id).toBe(channelId);
    expect(newState.channels[channelId].unread_msgs).toBe(0);

    // Resetting the activeChannel
    action = {
      type: EChatActions.ACTIVE_CHANNEL_CHANGED,
      payload: { _id: undefined },
    };

    newState = userReducer(newState, action);
    expect(newState.activeChannelInfo).toBeFalsy();
  });

  it('should handle REMOVED_FROM_CHANNEL', () => {
    const channelId = '1';
    const channel: IChannel = {
      _id: channelId,
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 10,
    };

    // setting the activeChannel
    const initialState: TChatState = {
      users: {},
      channels: {
        [channelId]: channel,
      },
      activeChannelInfo: {
        _id: channelId,
        messages: [],
        totalMessages: 0,
        queue: [],
      },
    };
    const action: TChatAction = {
      type: EChatActions.REMOVED_FROM_CHANNEL,
      payload: { channelId },
    };

    const newState = userReducer(initialState, action);
    expect(newState.channels[channelId]).toBeFalsy();
    expect(newState.activeChannelInfo).toBeFalsy();
  });

  it('should handle NEW_USER_CONFIRMED', () => {
    const userId = '1';
    const otherUser: IOtherUser = {
      _id: userId,
      nickname: 'Test',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: false,
    };
    const initialState: TChatState = {
      users: {},
      channels: {},
    };

    const action: TChatAction = {
      type: EChatActions.NEW_USER_CONFIRMED,
      payload: otherUser,
    };

    const newState = userReducer(initialState, action);
    expect(newState.users[userId]).toBeTruthy();
  });

  it('should handle NEW_MESSAGES_RECEIVED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message1: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const message2: IMessage = {
      _id: '3',
      body: 'Test message 2',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const messages: IMessage[] = [message1];

    // With activeChannelInfo
    let initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [message2],
        totalMessages: 1,
        queue: [],
      },
    };

    const action: TChatAction = {
      type: EChatActions.NEW_MESSAGES_RECEIVED,
      payload: {
        messages,
        totalMessages: -1,
        atTop: true,
      },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages[0]).toEqual(message1);
    expect(newState.activeChannelInfo?.totalMessages).toEqual(2);
    expect(newState.channels[channel._id].lastMessage).toEqual(message1);

    // Without activeChannelInfo
    initialState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
    };

    newState = userReducer(initialState, action);
    expect(newState.channels[channel._id].unread_msgs).toEqual(1);
    expect(newState.channels[channel._id].lastMessage).toEqual(message1);
  });

  it('should handle MESSAGE_ENQUEUED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [],
        totalMessages: 0,
        queue: [],
      },
    };

    const action: TChatAction = {
      type: EChatActions.MESSAGE_ENQUEUED,
      payload: message,
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.queue[0]).toEqual(message);
  });

  it('should handle MESSAGE_DEQUEUED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [],
        totalMessages: 0,
        queue: [message],
      },
    };

    const action: TChatAction = {
      type: EChatActions.MESSAGE_DEQUEUED,
      payload: message,
    };

    const newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.queue.length).toBe(0);
  });

  it('should handle LAST_SEEN_CHANGED', () => {
    const user = {
      _id: '1',
      nickname: 'Test 1',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };
    const channel: IChannel = {
      _id: '2',
      name: 'Channel 1',
      is_group: false,
      members: [
        {
          user_id: user._id,
          is_adm: false,
          last_seen: new Date(),
        },
      ],
      other_member_idx: 1,
      unread_msgs: 0,
    };

    const initialState: TChatState = {
      users: {
        [user._id]: user,
      },
      channels: {
        [channel._id]: channel,
      },
    };

    const newLastSeen = '2021-11-29T14:04:06.091Z';
    const action: TChatAction = {
      type: EChatActions.LAST_SEEN_CHANGED,
      payload: {
        channel_id: channel._id,
        user_id: user._id,
        last_seen: '2021-11-29T14:04:06.091Z',
      },
    };

    const newState = userReducer(initialState, action);
    expect(
      newState.channels[channel._id].members[0].last_seen.toISOString(),
    ).toBe(newLastSeen);
  });

  it('should handle USER_STATUS_CHANGED', () => {
    const user = {
      _id: '1',
      nickname: 'Test 1',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };

    const initialState: TChatState = {
      users: {
        [user._id]: user,
      },
      channels: {},
    };

    const newStatus = USER_STATUS.AWAY;
    const action: TChatAction = {
      type: EChatActions.USER_STATUS_CHANGED,
      payload: {
        user_id: user._id,
        newStatus,
      },
    };

    const newState = userReducer(initialState, action);
    expect(newState.users[user._id].status).toBe(newStatus);
  });

  it('should handle USER_THOUGHTS_CHANGED', () => {
    const user = {
      _id: '1',
      nickname: 'Test 1',
      thoughts: '',
      status: USER_STATUS.ACTIVE,
      online: true,
    };

    const initialState: TChatState = {
      users: {
        [user._id]: user,
      },
      channels: {},
    };

    const newThoughts = 'New thoughts...';
    const action: TChatAction = {
      type: EChatActions.USER_THOUGHTS_CHANGED,
      payload: {
        user_id: user._id,
        newThoughts,
      },
    };

    const newState = userReducer(initialState, action);
    expect(newState.users[user._id].thoughts).toBe(newThoughts);
  });

  it('should handle MESSAGE_IS_UPDATING_CHANGED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isUpdating: false,
    };

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [message],
        totalMessages: 1,
        queue: [],
      },
    };

    // value = true
    let action: TChatAction = {
      type: EChatActions.MESSAGE_IS_UPDATING_CHANGED,
      payload: {
        message_id: message._id,
        value: true,
      },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages[0].isUpdating).toBe(true);

    // value = false
    action = {
      type: EChatActions.MESSAGE_IS_UPDATING_CHANGED,
      payload: {
        message_id: message._id,
        value: false,
      },
    };

    newState = userReducer(newState, action);
    expect(newState.activeChannelInfo?.messages[0].isUpdating).toBe(false);
  });

  it('should handle MESSAGE_UPDATED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const initialMessage: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isUpdating: false,
    };
    channel.lastMessage = initialMessage;

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [initialMessage],
        totalMessages: 1,
        queue: [],
      },
    };

    const newMessage = { ...initialMessage, body: 'Updated text...' };
    const action: TChatAction = {
      type: EChatActions.MESSAGE_UPDATED,
      payload: newMessage,
    };

    const newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages[0].body).toBe(newMessage.body);
    expect(newState.channels[channel._id].lastMessage?.body).toBe(
      newMessage.body,
    );
  });

  it('should handle MESSAGE_IS_DELETING_CHANGED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleting: false,
    };

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [message],
        totalMessages: 1,
        queue: [],
      },
    };

    // value = true
    let action: TChatAction = {
      type: EChatActions.MESSAGE_IS_DELETING_CHANGED,
      payload: {
        message_id: message._id,
        value: true,
      },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages[0].isDeleting).toBe(true);

    // value = false
    action = {
      type: EChatActions.MESSAGE_IS_DELETING_CHANGED,
      payload: {
        message_id: message._id,
        value: false,
      },
    };

    newState = userReducer(newState, action);
    expect(newState.activeChannelInfo?.messages[0].isDeleting).toBe(false);
  });

  it('should handle MESSAGE_DELETED', () => {
    const channel: IChannel = {
      _id: '1',
      name: 'Channel 1',
      is_group: false,
      members: [],
      other_member_idx: 1,
      unread_msgs: 0,
    };
    const message1: IMessage = {
      _id: '2',
      body: 'Test message 1',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const message2: IMessage = {
      _id: '3',
      body: 'Test message 2',
      channel_id: channel._id,
      type: MESSAGE_TYPES.TEXT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    channel.lastMessage = message2;

    const initialState: TChatState = {
      users: {},
      channels: {
        [channel._id]: channel,
      },
      activeChannelInfo: {
        _id: channel._id,
        messages: [message1, message2],
        totalMessages: 2,
        queue: [],
      },
    };

    const action: TChatAction = {
      type: EChatActions.MESSAGE_DELETED,
      payload: {
        message: message2,
        lastMessage: message1,
      },
    };

    const newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages.length).toBe(1);
    expect(newState.activeChannelInfo?.messages[0]).toBe(message1);
    expect(newState.channels[channel._id].lastMessage).toBe(message1);
  });
});

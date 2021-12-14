import { USER_STATUS } from '~/constants/user_status';
import { EUserActions, TUserAction } from '~/redux/user/types';
import FACTORIES from '~/utils/factories';

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
    const initialState: TChatState = FACTORIES.states.chat();
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
    const initialState: TChatState = FACTORIES.states.chat({
      users: {
        [userId]: FACTORIES.models.otherUser({ _id: userId, online: false }),
      },
    });

    // value = true
    let data = { _id: userId, value: true };
    let action: TChatAction = {
      type: EChatActions.USER_ONLINE_STATUS_CHANGED,
      payload: data,
    };

    let newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);

    // value = false
    data = { _id: userId, value: false };
    action = {
      type: EChatActions.USER_ONLINE_STATUS_CHANGED,
      payload: data,
    };

    newState = userReducer(initialState, action);
    expect(newState.users[userId].online).toEqual(action.payload.value);
  });

  it('should handle CHANNEL_CREATED_OR_UPDATED', () => {
    const user1 = FACTORIES.models.otherUser();
    const user2 = FACTORIES.models.otherUser();
    const initialState: TChatState = FACTORIES.states.chat({
      users: {
        [user1._id]: user1,
        [user2._id]: user2,
      },
    });

    // new channel
    let otherMemberIdx = 1;
    const payload1: IChannel = FACTORIES.models.channel({
      members: [
        FACTORIES.models.member({ user_id: user1._id }),
        FACTORIES.models.member({ user_id: user2._id }),
      ],
      is_group: false,
      other_member_idx: otherMemberIdx,
    });

    let action: TChatAction = {
      type: EChatActions.CHANNEL_CREATED_OR_UPDATED,
      payload: payload1,
    };

    let newState = userReducer(initialState, action);
    expect(newState.channels[payload1._id]).toBeTruthy();
    expect(newState.channels[payload1._id].name).toEqual(user2.nickname);
    expect(newState.users[user1._id].channel_id).toEqual(payload1._id);
    expect(newState.users[user2._id].channel_id).toEqual(payload1._id);

    // update channel
    otherMemberIdx = 0;
    const payload2: IChannel = {
      ...payload1,
      other_member_idx: otherMemberIdx,
    };
    action = {
      type: EChatActions.CHANNEL_CREATED_OR_UPDATED,
      payload: payload2,
    };

    newState = userReducer(initialState, action);
    expect(newState.channels[payload2._id]).toBeTruthy();
    expect(newState.channels[payload2._id].name).toEqual(user1.nickname);
    expect(newState.channels[payload2._id].other_member_idx).toEqual(
      otherMemberIdx,
    );
    expect(newState.users[user1._id].channel_id).toEqual(payload2._id);
    expect(newState.users[user2._id].channel_id).toEqual(payload2._id);
  });

  it('should handle ACTIVE_CHANNEL_CHANGED', () => {
    const channel: IChannel = FACTORIES.models.channel({
      unread_msgs: 10,
    });

    // setting the activeChannel
    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: undefined,
    });
    let action: TChatAction = {
      type: EChatActions.ACTIVE_CHANNEL_CHANGED,
      payload: { _id: channel._id },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo).toBeTruthy();
    expect(newState.activeChannelInfo?._id).toBe(channel._id);
    expect(newState.channels[channel._id].unread_msgs).toBe(0);

    // resetting the activeChannel
    action = {
      type: EChatActions.ACTIVE_CHANNEL_CHANGED,
      payload: { _id: undefined },
    };

    newState = userReducer(newState, action);
    expect(newState.activeChannelInfo).toBeFalsy();
  });

  it('should handle REMOVED_FROM_CHANNEL', () => {
    const channel: IChannel = FACTORIES.models.channel();

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
      }),
    });

    const action: TChatAction = {
      type: EChatActions.REMOVED_FROM_CHANNEL,
      payload: { channelId: channel._id },
    };

    const newState = userReducer(initialState, action);
    expect(newState.channels[channel._id]).toBeFalsy();
    expect(newState.activeChannelInfo).toBeFalsy();
  });

  it('should handle NEW_USER_CONFIRMED', () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser();
    const initialState: TChatState = FACTORIES.states.chat({
      users: {},
    });

    const action: TChatAction = {
      type: EChatActions.NEW_USER_CONFIRMED,
      payload: otherUser,
    };

    const newState = userReducer(initialState, action);
    expect(newState.users[otherUser._id]).toBeTruthy();
  });

  it('should handle NEW_MESSAGES_RECEIVED', () => {
    const channel: IChannel = FACTORIES.models.channel({
      unread_msgs: 0,
    });
    const message1: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });
    const message2: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });

    // with activeChannelInfo
    let initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        messages: [message2],
        totalMessages: 1,
      }),
    });

    const action: TChatAction = {
      type: EChatActions.NEW_MESSAGES_RECEIVED,
      payload: {
        messages: [message1],
        totalMessages: -1,
        atTop: true,
      },
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.messages[0]).toEqual(message1);
    expect(newState.activeChannelInfo?.totalMessages).toEqual(2);
    expect(newState.channels[channel._id].lastMessage).toEqual(message2);

    // without activeChannelInfo
    initialState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: undefined,
    });

    newState = userReducer(initialState, action);
    expect(newState.channels[channel._id].unread_msgs).toEqual(1);
    expect(newState.channels[channel._id].lastMessage).toEqual(message1);
  });

  it('should handle MESSAGE_ENQUEUED', () => {
    const channel: IChannel = FACTORIES.models.channel();
    const message: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        queue: [],
      }),
    });

    const action: TChatAction = {
      type: EChatActions.MESSAGE_ENQUEUED,
      payload: message,
    };

    let newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.queue[0]).toEqual(message);
  });

  it('should handle MESSAGE_DEQUEUED', () => {
    const channel: IChannel = FACTORIES.models.channel();
    const message: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        queue: [message],
      }),
    });

    const action: TChatAction = {
      type: EChatActions.MESSAGE_DEQUEUED,
      payload: message,
    };

    const newState = userReducer(initialState, action);
    expect(newState.activeChannelInfo?.queue.length).toBe(0);
  });

  it('should handle LAST_SEEN_CHANGED', () => {
    const user = FACTORIES.models.otherUser();
    const channel: IChannel = FACTORIES.models.channel({
      members: [
        FACTORIES.models.member({
          user_id: user._id,
          last_seen: new Date(),
        }),
      ],
    });

    const initialState: TChatState = FACTORIES.states.chat({
      users: { [user._id]: user },
      channels: { [channel._id]: channel },
    });

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
    const user = FACTORIES.models.otherUser({
      status: USER_STATUS.ACTIVE,
    });

    const initialState: TChatState = FACTORIES.states.chat({
      users: { [user._id]: user },
    });

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
    const user = FACTORIES.models.otherUser({
      thoughts: '',
    });

    const initialState: TChatState = FACTORIES.states.chat({
      users: { [user._id]: user },
    });

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
    const channel: IChannel = FACTORIES.models.channel();
    const message: IMessage = FACTORIES.models.message({
      isUpdating: false,
    });

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        messages: [message],
        totalMessages: 1,
      }),
    });

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
    const channel: IChannel = FACTORIES.models.channel();
    const initialMessage: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
      body: 'Test message 1',
    });
    channel.lastMessage = initialMessage;

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        messages: [initialMessage],
        totalMessages: 1,
      }),
    });

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
    const channel: IChannel = FACTORIES.models.channel();
    const message: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
      isDeleting: false,
    });

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        messages: [message],
        totalMessages: 1,
      }),
    });

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
    const channel: IChannel = FACTORIES.models.channel();
    const message1: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });
    const message2: IMessage = FACTORIES.models.message({
      channel_id: channel._id,
    });

    channel.lastMessage = message2;

    const initialState: TChatState = FACTORIES.states.chat({
      channels: { [channel._id]: channel },
      activeChannelInfo: FACTORIES.models.activeChannelInfo({
        _id: channel._id,
        messages: [message1, message2],
        totalMessages: 2,
      }),
    });

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

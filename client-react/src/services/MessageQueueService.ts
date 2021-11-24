import i18n from 'i18next';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  addMessages,
  addToMessagesQueue,
  removeFromMessagesQueue,
  setMessageIsUpdating,
  updateMessage,
} from '~/redux/chat/actions';
import {
  IEditMessageCredentials,
  IMessage,
  ISendMessageCredentials,
} from '~/redux/chat/types';
import store from '~/redux/store';
import { getUser } from '~/redux/user/reducer';
import { Toast } from '~/utils/Toast';

import { ApiService } from '.';

type TToSendMessage =
  | ISendMessageCredentials
  | FormData
  | IEditMessageCredentials;
interface IQueueEntry {
  queueAction: TQueueAction;
  queuedMsgs: IMessage[];
  toSendMsg: TToSendMessage;
}
interface IQueue {
  [channelId: string]: IQueueEntry[];
}
interface IServerResponse {
  message: string;
  messagesObjs?: IMessage[];
  messageObj?: IMessage;
}

const MAX_ATTEMPTS = 3;

const QUEUE_ACTIONS = {
  SEND_TEXT_MESSAGE: 'SEND_TEXT_MESSAGE',
  SEND_FILE_MESSAGES: 'SEND_FILE_MESSAGES',
  EDIT_TEXT_MESSAGE: 'EDIT_TEXT_MESSAGE',
} as const;
type TQueueAction = typeof QUEUE_ACTIONS[keyof typeof QUEUE_ACTIONS];

class MessageQueueService {
  private _queues: IQueue;
  private _running: Record<string, boolean>;

  constructor() {
    this._queues = {};
    this._running = {};
  }

  enqueue(message: TToSendMessage, queueAction: TQueueAction) {
    const userId = getUser(store.getState())._id;
    const queuedMsgs = [];
    let channelId: string = '';

    if (queueAction === QUEUE_ACTIONS.SEND_FILE_MESSAGES) {
      const formData = message as FormData;
      channelId = formData.get('channel_id') as string;
      const dateTime = new Date().getTime();

      formData.getAll('files').forEach((entry, i) => {
        const file = entry as File;

        let path = '';
        if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
          path = URL.createObjectURL(file);
        }

        const queueMsg: IMessage = {
          _id: `${dateTime + i}`,
          from_id: userId,
          channel_id: channelId,
          body: {
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            path,
          },
          createdAt: new Date(dateTime + i),
          updatedAt: new Date(dateTime + i),
          type: MESSAGE_TYPES.UPLOADED_FILE,
        };

        queuedMsgs.push(queueMsg);
        store.dispatch<any>(addToMessagesQueue(queueMsg));
      });
    } else if (queueAction === QUEUE_ACTIONS.SEND_TEXT_MESSAGE) {
      const credentials = message as ISendMessageCredentials;
      channelId = credentials.channel_id;
      const date = new Date();

      const queueMsg: IMessage = {
        _id: `${date.getTime()}`,
        from_id: userId,
        channel_id: channelId,
        body: credentials.body,
        createdAt: date,
        updatedAt: date,
        type: MESSAGE_TYPES.TEXT,
      };

      queuedMsgs.push(queueMsg);
      store.dispatch<any>(addToMessagesQueue(queueMsg));
    } else if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
      const credentials = message as IEditMessageCredentials;
      channelId = credentials.message.channel_id;

      const queueMsg: IMessage = {
        ...credentials.message,
        body: credentials.newBody,
      };

      queuedMsgs.push(queueMsg);
      store.dispatch<any>(setMessageIsUpdating(credentials.message._id, true));
    }

    if (queuedMsgs.length && channelId) {
      if (!this._queues[channelId]) this._queues[channelId] = [];
      this._queues[channelId].push({
        queueAction,
        queuedMsgs,
        toSendMsg: message,
      });
      this._runQueue(channelId);
    }
  }

  private _runQueue(channelId: string) {
    if (!this._running[channelId]) {
      this._running[channelId] = true;
      setTimeout(this._run(channelId), 0);
    }
  }

  private _run(channelId: string) {
    return async () => {
      while (!!this._queues[channelId] && this._queues[channelId].length > 0) {
        const { queueAction, queuedMsgs, toSendMsg } = this._queues[
          channelId
        ].shift() as IQueueEntry;

        let sent = false;
        let attempts = 0;
        let ret: IServerResponse | null = null;
        while (!sent && attempts < MAX_ATTEMPTS) {
          try {
            ret = await this._sendMessage(queueAction, queuedMsgs, toSendMsg);
            sent = true;
          } catch (err) {
            attempts += 1;
          }
        }

        queuedMsgs.forEach(msg => {
          store.dispatch<any>(removeFromMessagesQueue(msg));
          if (typeof msg.body !== 'string' && !!msg.body.path)
            URL.revokeObjectURL(msg.body.path);
        });

        if (sent) {
          let messages: IMessage[] | null = null;
          if (!!ret && !!ret.messageObj) {
            messages = [ret.messageObj];
          } else if (!!ret && !!ret.messagesObjs) {
            messages = ret.messagesObjs;
          }

          if (!!messages && messages.length) {
            if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
              store.dispatch<any>(updateMessage(messages[0]));
            } else {
              store.dispatch<any>(addMessages(messages));
            }
          }
        } else {
          if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
            const message = toSendMsg as IEditMessageCredentials;
            store.dispatch<any>(
              setMessageIsUpdating(message.message._id, false),
            );
          }
          this._onError(queuedMsgs);
        }
      }
      this._running[channelId] = false;
    };
  }

  private _sendMessage(
    queueAction: TQueueAction,
    queuedMsgs: IMessage[],
    toSendMsg: TToSendMessage,
  ) {
    const type = queuedMsgs[0].type;

    if (queueAction === QUEUE_ACTIONS.SEND_FILE_MESSAGES) {
      return ApiService.chat.sendFiles(toSendMsg as FormData);
    } else if (queueAction === QUEUE_ACTIONS.SEND_TEXT_MESSAGE) {
      return ApiService.chat.sendMessage(toSendMsg as ISendMessageCredentials);
    } else if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
      return ApiService.chat.editMessage(toSendMsg as IEditMessageCredentials);
    } else {
      console.error('MessageQueueService._sendMessage:> Invalid type: ', type);
      return Promise.reject({});
    }
  }

  private _onError(queuedMsgs: IMessage[]) {
    console.error(
      "MessageQueueService._onError:> Messages couldn't be sent: ",
      queuedMsgs,
    );

    // const trans = i18n.t;
    Toast.error({
      html: i18n.t('Errors:Unable to send {{count}} of your messages', {
        count: queuedMsgs.length,
      }),
    });
  }
}

export { QUEUE_ACTIONS };
export type { TQueueAction };
export default new MessageQueueService();

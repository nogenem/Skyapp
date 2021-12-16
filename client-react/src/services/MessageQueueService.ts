import i18n from 'i18next';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  newMessagesReceived,
  messageEnqueued,
  messageDeleted,
  messageDequeued,
  messageIsDeletingChanged,
  messageIsUpdatingChanged,
  messageUpdated,
} from '~/redux/chat/actions';
import {
  IDeleteMessageCredentials,
  IEditMessageCredentials,
  IMessage,
  ISendFilesCredentials,
  ISendMessageCredentials,
} from '~/redux/chat/types';
import store from '~/redux/store';
import { selectUserId } from '~/redux/user/selectors';
import { Toast } from '~/utils/Toast';

import ApiService from './ApiService';

type TToSendMessage =
  | ISendMessageCredentials
  | ISendFilesCredentials
  | IEditMessageCredentials
  | IDeleteMessageCredentials;
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
  lastMessage?: IMessage;
}

const MAX_ATTEMPTS = 3;

const QUEUE_ACTIONS = {
  SEND_TEXT_MESSAGE: 'SEND_TEXT_MESSAGE',
  SEND_FILE_MESSAGES: 'SEND_FILE_MESSAGES',
  EDIT_TEXT_MESSAGE: 'EDIT_TEXT_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
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
    const userId = selectUserId(store.getState());
    const queuedMsgs = [];
    let channelId: string = '';

    if (queueAction === QUEUE_ACTIONS.SEND_FILE_MESSAGES) {
      const credentials = message as ISendFilesCredentials;
      const formData = credentials.files;
      channelId = credentials.channelId;
      const dateTime = new Date().getTime();

      formData.getAll('files').forEach((entry, i) => {
        const file = entry as File;

        let path = '';
        if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
          path = URL.createObjectURL(file);
        }

        const queueMsg: IMessage = {
          _id: `${dateTime + i}`,
          fromId: userId,
          channelId: channelId,
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
        store.dispatch<any>(messageEnqueued(queueMsg));
      });
    } else if (queueAction === QUEUE_ACTIONS.SEND_TEXT_MESSAGE) {
      const credentials = message as ISendMessageCredentials;
      channelId = credentials.channelId;
      const date = new Date();

      const queueMsg: IMessage = {
        _id: `${date.getTime()}`,
        fromId: userId,
        channelId: channelId,
        body: credentials.body,
        createdAt: date,
        updatedAt: date,
        type: MESSAGE_TYPES.TEXT,
      };

      queuedMsgs.push(queueMsg);
      store.dispatch<any>(messageEnqueued(queueMsg));
    } else if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
      const credentials = message as IEditMessageCredentials;
      channelId = credentials.message.channelId;

      const queueMsg: IMessage = {
        ...credentials.message,
        body: credentials.newBody,
      };

      queuedMsgs.push(queueMsg);
      store.dispatch<any>(
        messageIsUpdatingChanged(credentials.message._id, true),
      );
    } else if (queueAction === QUEUE_ACTIONS.DELETE_MESSAGE) {
      const credentials = message as IEditMessageCredentials;
      channelId = credentials.message.channelId;

      const queueMsg: IMessage = credentials.message;

      queuedMsgs.push(queueMsg);
      store.dispatch<any>(
        messageIsDeletingChanged(credentials.message._id, true),
      );
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
          store.dispatch<any>(messageDequeued(msg));
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
              store.dispatch<any>(messageUpdated(messages[0]));
            } else if (queueAction === QUEUE_ACTIONS.DELETE_MESSAGE) {
              store.dispatch<any>(
                messageDeleted(messages[0], ret?.lastMessage),
              );
            } else {
              store.dispatch<any>(newMessagesReceived(messages));
            }
          }
        } else {
          if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
            const message = toSendMsg as IEditMessageCredentials;
            store.dispatch<any>(
              messageIsUpdatingChanged(message.message._id, false),
            );
          } else if (queueAction === QUEUE_ACTIONS.DELETE_MESSAGE) {
            const message = toSendMsg as IDeleteMessageCredentials;
            store.dispatch<any>(
              messageIsDeletingChanged(message.message._id, false),
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
      return ApiService.message.storeFiles(toSendMsg as ISendFilesCredentials);
    } else if (queueAction === QUEUE_ACTIONS.SEND_TEXT_MESSAGE) {
      return ApiService.message.storeMessage(
        toSendMsg as ISendMessageCredentials,
      );
    } else if (queueAction === QUEUE_ACTIONS.EDIT_TEXT_MESSAGE) {
      return ApiService.message.updateBody(
        toSendMsg as IEditMessageCredentials,
      );
    } else if (queueAction === QUEUE_ACTIONS.DELETE_MESSAGE) {
      return ApiService.message.delete(toSendMsg as IDeleteMessageCredentials);
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

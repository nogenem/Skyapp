import i18n from 'i18next';

import { MESSAGE_TYPES } from '~/constants/message_types';
import {
  addToMessagesQueue,
  removeFromMessagesQueue,
} from '~/redux/chat/actions';
import { IMessage, ISendMessageCredentials } from '~/redux/chat/types';
import store from '~/redux/store';
import { getUser } from '~/redux/user/reducer';
import sanitize from '~/utils/sanitize';
import { Toast } from '~/utils/Toast';

import { ApiService } from '.';

type TToSendMessage = ISendMessageCredentials | FormData;
interface IQueueEntry {
  queuedMsgs: IMessage[];
  toSendMsg: TToSendMessage;
}
interface IQueue {
  [channelId: string]: IQueueEntry[];
}

const MAX_ATTEMPTS = 3;

class MessageQueueService {
  private _queues: IQueue;
  private _running: Record<string, boolean>;

  constructor() {
    this._queues = {};
    this._running = {};
  }

  enqueue(message: TToSendMessage) {
    const userId = getUser(store.getState())._id;
    const queuedMsgs = [];
    let channelId: string = '';

    if (message instanceof FormData) {
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
            originalName: sanitize(file.name),
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
    } else if (
      message instanceof Object &&
      message.channel_id &&
      message.body
    ) {
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
    }

    if (queuedMsgs.length && channelId) {
      if (!this._queues[channelId]) this._queues[channelId] = [];
      this._queues[channelId].push({
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
        const { queuedMsgs, toSendMsg } = this._queues[
          channelId
        ].shift() as IQueueEntry;

        let sent = false;
        let attempts = 0;
        while (!sent && attempts < MAX_ATTEMPTS) {
          try {
            await this._sendMessage(queuedMsgs, toSendMsg);
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

        if (!sent) {
          this._onError(queuedMsgs);
        }
      }
      this._running[channelId] = false;
    };
  }

  private _sendMessage(queuedMsgs: IMessage[], toSendMsg: TToSendMessage) {
    const type = queuedMsgs[0].type;

    switch (type) {
      case MESSAGE_TYPES.TEXT: {
        const message = toSendMsg as ISendMessageCredentials;
        return ApiService.chat.sendMessage(message);
      }
      case MESSAGE_TYPES.UPLOADED_FILE: {
        const message = toSendMsg as FormData;
        return ApiService.chat.sendFiles(message);
      }
      default: {
        console.error(
          'MessageQueueService._sendMessage:> Invalid type: ',
          type,
        );
        return Promise.reject({});
      }
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

export default new MessageQueueService();

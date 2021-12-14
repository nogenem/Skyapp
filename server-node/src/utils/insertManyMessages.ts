import { Message } from '~/models';
import type { IMessage, IMessageDoc } from '~/models';

export default (messages: IMessage[]): Promise<IMessageDoc[]> => {
  // Without this, all dates would be the same...
  const baseDate = new Date().getTime();
  const messages2insert = messages.map((message, i) => {
    return {
      ...message,
      createdAt: new Date(baseDate + i),
      updatedAt: new Date(baseDate + i),
    };
  });
  return Message.insertMany(messages2insert);
};

import { IO_USER_THOUGHTS_CHANGED } from '~/constants/socket_events';

import type { IUserThoughtsChanged, TEmitterFunc } from './types';

const userThoughtsChanged: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_USER_THOUGHTS_CHANGED;
  const data = eventData as IUserThoughtsChanged;

  Object.keys(clients).forEach(userId => {
    if (userId !== data.userId) {
      io.to(clients[userId].socketId).emit(event, data);
    }
  });
};

export default userThoughtsChanged;

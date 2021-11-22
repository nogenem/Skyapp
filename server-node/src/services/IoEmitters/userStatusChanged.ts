import { IO_USER_STATUS_CHANGED } from '~/constants/socket_events';

import type { IUserStatusChanged, TEmitterFunc } from './types';

const userStatusChanged: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_USER_STATUS_CHANGED;
  const data = eventData as IUserStatusChanged;

  Object.keys(clients).forEach(userId => {
    if (userId !== data.user_id) {
      io.to(clients[userId].socketId).emit(event, data);
    }
  });
};

export default userStatusChanged;

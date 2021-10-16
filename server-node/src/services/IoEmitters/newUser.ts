import { IO_NEW_USER } from '~/constants/socket_events';
import { IChatUser } from '~/models';

import type { TEmitterFunc } from './types';

const newUser: TEmitterFunc = async (io, clients, eventData) => {
  const event = IO_NEW_USER;
  const user = eventData as IChatUser;

  Object.values(clients).forEach(({ socketId }) => {
    io.to(socketId).emit(event, user);
  });
};

export default newUser;

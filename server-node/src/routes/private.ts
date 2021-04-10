import { Router } from 'express';

import { ChatController, UserController } from '~/controllers';
import { validate } from '~/middlewares';
import { chat, user } from '~/validators';

const routes = Router();

// TODO: Remove later
routes.post('/chat/test', validate(chat.test), ChatController.test);

routes.post(
  '/user/change_status',
  validate(user.changeStatus),
  UserController.changeStatus,
);
routes.post(
  '/user/change_thoughts',
  validate(user.changeThoughts),
  UserController.changeThoughts,
);

export default routes;

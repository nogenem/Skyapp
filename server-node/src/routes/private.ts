import { Router } from 'express';

import { ChatController, UserController } from '~/controllers';
import { validate } from '~/middlewares';
import { chat, user } from '~/validators';

const routes = Router();

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

routes.post(
  '/chat/private',
  validate(chat.createPrivateChannel),
  ChatController.createPrivateChannel,
);
routes.post(
  '/chat/group',
  validate(chat.createGroupChannel),
  ChatController.createGroupChannel,
);
routes.patch(
  '/chat/group',
  validate(chat.updateGroupChannel),
  ChatController.updateGroupChannel,
);
routes.post(
  '/chat/group/leave',
  validate(chat.leaveGroupChannel),
  ChatController.leaveGroupChannel,
);

export default routes;

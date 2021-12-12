import { Router } from 'express';
import multer from 'multer';
import slugify from 'slugify';

import fileUploadLimits from '~/constants/file_upload_limits';
import { ChatController, UserController } from '~/controllers';
import { validate } from '~/middlewares';
import { chat, user } from '~/validators';

const multerStorage = multer.diskStorage({
  destination: '~/../public/uploads',
  filename: (req, file, cb) => {
    const prefix = Date.now() + Math.round(Math.random() * 1e9);
    // https://stackoverflow.com/a/52768801
    const name = slugify(`${prefix}-${file.originalname}`, {
      remove: /[<>#%{}|\\^~[\]`;?:@=&'"]/g,
    });
    cb(null, name);
  },
});

const multerUploader = multer({
  // dest: "~/../public/uploads",
  storage: multerStorage,
  limits: fileUploadLimits,
}).array('files');

const routes = Router();

routes.patch(
  '/user/status',
  validate(user.changeStatus),
  UserController.changeStatus,
);
routes.patch(
  '/user/thoughts',
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
  '/chat/group/:channel_id',
  validate(chat.updateGroupChannel),
  ChatController.updateGroupChannel,
);
routes.post(
  '/chat/group/:channel_id/leave',
  validate(chat.leaveGroupChannel),
  ChatController.leaveGroupChannel,
);
routes.get(
  '/chat/:channel_id/messages',
  validate(chat.getMessages),
  ChatController.getMessages,
);
routes.post(
  '/chat/:channel_id/messages',
  validate(chat.sendMessage),
  ChatController.sendMessage,
);
routes.post(
  '/chat/:channel_id/files',
  validate(chat.sendFiles),
  multerUploader,
  ChatController.sendFiles,
);
routes.patch(
  '/chat/:channel_id/messages/:message_id',
  validate(chat.editMessage),
  ChatController.editMessage,
);
routes.delete(
  '/chat/:channel_id/messages/:message_id',
  validate(chat.deleteMessage),
  ChatController.deleteMessage,
);

export default routes;

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
routes.get(
  '/chat/messages',
  validate(chat.getMessages),
  ChatController.getMessages,
);
routes.post(
  '/chat/messages',
  validate(chat.sendMessage),
  ChatController.sendMessage,
);
routes.post(
  '/chat/files',
  validate(chat.sendFiles),
  multerUploader,
  ChatController.sendFiles,
);

export default routes;

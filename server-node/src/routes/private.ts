import { Router } from 'express';
import multer from 'multer';
import slugify from 'slugify';

import fileUploadLimits from '~/constants/file_upload_limits';
import {
  ChannelController,
  MessageController,
  UserController,
} from '~/controllers';
import { validate } from '~/middlewares';
import { channel, message, user } from '~/validators';

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
  '/channel/private',
  validate(channel.private.store),
  ChannelController.private.store,
);
routes.post(
  '/channel/group',
  validate(channel.group.store),
  ChannelController.group.store,
);
routes.patch(
  '/channel/group/:channel_id',
  validate(channel.group.update),
  ChannelController.group.update,
);
routes.post(
  '/channel/group/:channel_id/leave',
  validate(channel.group.leave),
  ChannelController.group.leave,
);
routes.get(
  '/channel/:channel_id/messages',
  validate(message.all),
  MessageController.all,
);
routes.post(
  '/channel/:channel_id/messages',
  validate(message.storeMessage),
  MessageController.storeMessage,
);
routes.post(
  '/channel/:channel_id/files',
  validate(message.storeFiles),
  multerUploader,
  MessageController.storeFiles,
);
routes.patch(
  '/channel/:channel_id/messages/:message_id',
  validate(message.updateBody),
  MessageController.updateBody,
);
routes.delete(
  '/channel/:channel_id/messages/:message_id',
  validate(message.delete),
  MessageController.delete,
);

export default routes;

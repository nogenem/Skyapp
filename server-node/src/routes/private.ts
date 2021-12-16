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
  validate(user.updateStatus),
  UserController.updateStatus,
);
routes.patch(
  '/user/thoughts',
  validate(user.updateThoughts),
  UserController.updateThoughts,
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
  '/channel/group/:channelId',
  validate(channel.group.update),
  ChannelController.group.update,
);
routes.post(
  '/channel/group/:channelId/leave',
  validate(channel.group.leave),
  ChannelController.group.leave,
);
routes.get(
  '/channel/:channelId/messages',
  validate(message.all),
  MessageController.all,
);
routes.post(
  '/channel/:channelId/messages',
  validate(message.storeMessage),
  MessageController.storeMessage,
);
routes.post(
  '/channel/:channelId/files',
  validate(message.storeFiles),
  multerUploader,
  MessageController.storeFiles,
);
routes.patch(
  '/channel/:channelId/messages/:messageId',
  validate(message.updateBody),
  MessageController.updateBody,
);
routes.delete(
  '/channel/:channelId/messages/:messageId',
  validate(message.delete),
  MessageController.delete,
);

export default routes;

import { body } from 'express-validator';

import { NEED_AT_LEAST_2_MEMBERS_TO_CREATE_GROUP } from '~/constants/error_messages';
import { invalidIdError } from '~/utils/errors';

const chat = {
  createPrivateChannel: [
    body('_id').trim().not().isEmpty().withMessage(invalidIdError()),
  ],
  createGroupChannel: [
    body('name').trim().not().isEmpty(),
    body('members')
      .isArray({ min: 2 })
      .withMessage(NEED_AT_LEAST_2_MEMBERS_TO_CREATE_GROUP),
    body('admins').isArray(),
  ],
  updateGroupChannel: [
    body('channel_id').trim().not().isEmpty().withMessage(invalidIdError()),
    body('name').trim().not().isEmpty(),
    body('members')
      .isArray({ min: 2 })
      .withMessage(NEED_AT_LEAST_2_MEMBERS_TO_CREATE_GROUP),
    body('admins').isArray(),
  ],
};

export default chat;

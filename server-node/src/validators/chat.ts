import { body, query } from 'express-validator';

import {
  NEED_AT_LEAST_2_MEMBERS_TO_CREATE_GROUP,
  OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0,
} from '~/constants/error_messages';
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
  leaveGroupChannel: [
    body('channel_id').trim().not().isEmpty().withMessage(invalidIdError()),
  ],
  getMessages: [
    query('channel_id').trim().not().isEmpty().withMessage(invalidIdError()),
    query('offset')
      .isInt({ min: 0 })
      .withMessage(OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0)
      .toInt(),
  ],
};

export default chat;

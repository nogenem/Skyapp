import { body, query } from 'express-validator';

import {
  FIELD_CANT_BE_EMPY,
  groupHasTooFewMembers,
  OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0,
} from '~/constants/error_messages';
import { MIN_GROUP_CHANNEL_MEMBERS } from '~/constants/validation_limits';
import { invalidIdError } from '~/utils/errors';

const chat = {
  createPrivateChannel: [
    body('_id').trim().not().isEmpty().withMessage(invalidIdError()),
  ],
  createGroupChannel: [
    body('name').trim().not().isEmpty(),
    body('members')
      .isArray({ min: MIN_GROUP_CHANNEL_MEMBERS })
      .withMessage(groupHasTooFewMembers(MIN_GROUP_CHANNEL_MEMBERS)),
    body('admins').isArray(),
  ],
  updateGroupChannel: [
    body('channel_id').trim().not().isEmpty().withMessage(invalidIdError()),
    body('name').trim().not().isEmpty(),
    body('members')
      .isArray({ min: MIN_GROUP_CHANNEL_MEMBERS })
      .withMessage(groupHasTooFewMembers(MIN_GROUP_CHANNEL_MEMBERS)),
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
  sendMessage: [
    body('channel_id').trim().not().isEmpty().withMessage(invalidIdError()),
    body('body').trim().not().isEmpty().withMessage(FIELD_CANT_BE_EMPY),
  ],
  sendFiles: [],
  editMessage: [
    body('message_id').trim().not().isEmpty().withMessage(invalidIdError()),
    body('newBody').trim().not().isEmpty().withMessage(FIELD_CANT_BE_EMPY),
  ],
  deleteMessage: [],
};

export default chat;

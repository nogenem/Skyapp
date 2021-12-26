import { body } from 'express-validator';

import { groupHasTooFewMembers } from '~/constants/error_messages';
import { MIN_GROUP_CHANNEL_MEMBERS } from '~/constants/validation_limits';
import { invalidIdError } from '~/utils/errors';

const channel = {
  private: {
    store: [
      body('otherUserId').trim().not().isEmpty().withMessage(invalidIdError()),
    ],
  },
  group: {
    store: [
      body('name').trim().not().isEmpty(),
      body('members')
        .isArray({ min: MIN_GROUP_CHANNEL_MEMBERS })
        .withMessage(groupHasTooFewMembers(MIN_GROUP_CHANNEL_MEMBERS)),
      body('admins').isArray(),
    ],
    update: [
      body('name').trim().not().isEmpty(),
      body('members')
        .isArray({ min: MIN_GROUP_CHANNEL_MEMBERS })
        .withMessage(groupHasTooFewMembers(MIN_GROUP_CHANNEL_MEMBERS)),
      body('admins').isArray(),
    ],
    leave: [],
  },
};

export default channel;

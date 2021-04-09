import { body } from 'express-validator';

import { USER_STATUS } from '~/constants/user_status';

import { INVALID_USER_STATUS } from '../constants/error_messages';

const USER_STATUS_VALUES = Object.values(USER_STATUS);

const user = {
  changeStatus: [
    body('newStatus')
      .isInt()
      .withMessage(INVALID_USER_STATUS)
      .bail()

      .toInt()
      .isIn(USER_STATUS_VALUES)
      .withMessage(INVALID_USER_STATUS),
  ],
};

export default user;

import { body, query } from 'express-validator';

import {
  FIELD_CANT_BE_EMPY,
  OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0,
} from '~/constants/error_messages';

const message = {
  all: [
    query('offset')
      .isInt({ min: 0 })
      .withMessage(OFFSET_HAS_TO_BE_A_NUMBER_GREATER_OR_EQUAL_TO_0)
      .toInt(),
  ],
  storeMessage: [
    body('body').trim().not().isEmpty().withMessage(FIELD_CANT_BE_EMPY),
  ],
  storeFiles: [],
  updateBody: [
    body('newBody').trim().not().isEmpty().withMessage(FIELD_CANT_BE_EMPY),
  ],
  delete: [],
};

export default message;

import { body } from 'express-validator';

import {
  INVALID_EMAIL,
  PASSWORDS_MUST_MATCH,
  fieldIsTooShort,
} from '../constants/error_messages';
import {
  MIN_NICKNAME_LEN,
  MIN_PASSWORD_LEN,
} from '../constants/validation_limits';

const auth = {
  signup: [
    body('nickname')
      .trim()
      .isLength({ min: MIN_NICKNAME_LEN })
      .withMessage(fieldIsTooShort(MIN_NICKNAME_LEN)),
    body('email').trim().isEmail().withMessage(INVALID_EMAIL),
    body('password')
      .trim()
      .isLength({ min: MIN_PASSWORD_LEN })
      .withMessage(fieldIsTooShort(MIN_PASSWORD_LEN)),
    body('passwordConfirmation')
      .trim()
      .custom((value, { req }) => value === req.body.password.trim())
      .withMessage(PASSWORDS_MUST_MATCH),
  ],
};

export default auth;

import { body } from 'express-validator';

import { invalidOrExpiredTokenError } from '~/utils/errors';

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
  signUp: [
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
  signIn: [
    body('email').trim().isEmail().withMessage(INVALID_EMAIL),
    body('password')
      .trim()
      .isLength({ min: MIN_PASSWORD_LEN })
      .withMessage(fieldIsTooShort(MIN_PASSWORD_LEN)),
  ],
  confirmation: [
    body('token')
      .trim()
      .not()
      .isEmpty()
      .withMessage(invalidOrExpiredTokenError()),
  ],
  resendConfirmationEmail: [
    body('token')
      .trim()
      .not()
      .isEmpty()
      .withMessage(invalidOrExpiredTokenError()),
  ],
  validateToken: [
    body('token')
      .trim()
      .not()
      .isEmpty()
      .withMessage(invalidOrExpiredTokenError()),
  ],
  forgotPassword: [body('email').trim().isEmail().withMessage(INVALID_EMAIL)],
};

export default auth;

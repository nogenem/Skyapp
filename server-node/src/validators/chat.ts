import { body } from 'express-validator';

import { invalidIdError } from '~/utils/errors';

const chat = {
  createPrivateChannel: [
    body('_id').trim().not().isEmpty().withMessage(invalidIdError()),
  ],
};

export default chat;

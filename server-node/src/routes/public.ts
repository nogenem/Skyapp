import express from 'express';

import { AuthController } from '../controllers';
import { validate } from '../middlewares';
import { auth } from '../validators';

const routes = express.Router();

routes.post('/auth/signup', validate(auth.signUp), AuthController.signUp);
routes.post('/auth/signin', validate(auth.signIn), AuthController.signIn);
routes.post(
  '/auth/confirmation',
  validate(auth.confirmation),
  AuthController.confirmation,
);
routes.post(
  '/auth/resend_confirmation_email',
  validate(auth.resend_confirmation_email),
  AuthController.resend_confirmation_email,
);

export default routes;

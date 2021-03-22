import express from 'express';

import { AuthController } from '../controllers';
import { validate } from '../middlewares';
import { auth } from '../validators';

const routes = express.Router();

routes.post('/auth/signup', validate(auth.signUp), AuthController.signUp);
routes.post('/auth/signin', validate(auth.signIn), AuthController.signIn);

export default routes;

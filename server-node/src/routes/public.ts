import express from 'express';

import { AuthController } from '../controllers';
import { validate } from '../middlewares';
import { auth } from '../validators';

const routes = express.Router();

routes.post('/auth/signup', validate(auth.signup), AuthController.signup);

export default routes;

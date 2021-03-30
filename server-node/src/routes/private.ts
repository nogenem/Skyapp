import { Router } from 'express';

import { ChatController } from '~/controllers';
import { validate } from '~/middlewares';
import { chat } from '~/validators';

const routes = Router();

// TODO: Remove later
routes.post('/chat/test', validate(chat.test), ChatController.test);

export default routes;

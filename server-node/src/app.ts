import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';

import { publicRoutes } from './routes';
import { routeNotFoundError } from './utils/errors';
import handleErrors from './utils/handleErrors';

class AppController {
  app: Express;

  constructor() {
    this.app = express();

    this.generalMiddlewares();
    this.publicRoutes();
    this.exceptionHandler();
    this.notFoundHandler();
  }

  generalMiddlewares(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  publicRoutes(): void {
    this.app.use('/public', express.static('public'));
    this.app.use('/api', publicRoutes);
  }

  exceptionHandler(): void {
    this.app.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (err: Error, req: Request, res: Response, _next: NextFunction) => {
        return handleErrors(err, res);
      },
    );
  }

  notFoundHandler(): void {
    this.app.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (req: Request, res: Response, _next: NextFunction) => {
        return handleErrors(routeNotFoundError(), res);
      },
    );
  }
}

export default new AppController().app;

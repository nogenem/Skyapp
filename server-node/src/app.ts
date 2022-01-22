import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';
import i18nextMiddleware from 'i18next-http-middleware';

import i18n from './i18n';
import { auth } from './middlewares';
import { publicRoutes, privateRoutes } from './routes';
import { routeNotFoundError } from './utils/errors';
import handleErrors from './utils/handleErrors';

class AppController {
  app: Express;

  constructor() {
    this.app = express();

    this.generalMiddlewares();
    this.publicRoutes();
    this.privateMiddlewares();
    this.privateRoutes();
    this.exceptionHandler();
    this.notFoundHandler();
  }

  generalMiddlewares(): void {
    this.app.use(
      cors({
        origin: (requestOrigin, callback) => {
          callback(null, requestOrigin);
        },
        credentials: true,
      }),
    );
    this.app.use(express.json());
    this.app.use(i18nextMiddleware.handle(i18n));
    this.app.use((req, res, next) => {
      i18n.changeLanguage(req.language);
      next();
    });
  }

  publicRoutes(): void {
    this.app.use('/public', express.static('public'));
    this.app.use('/api', publicRoutes);
  }

  privateMiddlewares() {
    this.app.use(auth);
  }

  privateRoutes() {
    this.app.use('/api', privateRoutes);
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

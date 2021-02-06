import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';

import { publicRoutes } from './routes';

class AppController {
  app: Express;

  constructor() {
    this.app = express();

    this.generalMiddlewares();
    this.publicRoutes();
    this.exceptionHandler();
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
        const { NODE_ENV } = process.env;
        if (NODE_ENV === 'development') {
          return res.status(500).json(err);
        }

        return res.status(500).json({ error: 'Internal server error' });
      },
    );
  }
}

export default new AppController().app;

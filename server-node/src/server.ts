// eslint-disable-next-line import-helpers/order-imports
import dotenv from 'dotenv';

/* eslint-disable import/first */
const envs: { [env: string]: string } = {
  test: '.env',
  development: '.env',
  production: '.env.prod',
};
const env: string = process.env.NODE_ENV || 'development';
dotenv.config({
  path: envs[env],
});

import http from 'http';
import killPort from 'kill-port';

import app from './app';
import db from './db';
import IoController from './IoController';

db.openConnection();

process
  .on('exit', code => {
    console.error(`process exit: ${code}`);
    process.exit(code);
  })
  .on('SIGINT', () => {
    console.error('process SIGINT');
    process.exit(0);
  })
  .on('uncaughtException', err => {
    console.error(err);
    process.exit(0);
  });

const port = process.env.PORT || 5000;
killPort(port, 'tcp').then(() => {
  const server = http.createServer(app);
  const io = IoController.instance();

  io.init({ httpServer: server });
  server.listen(port, () => console.log(`Server running on port ${port}`));
});

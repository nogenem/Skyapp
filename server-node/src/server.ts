import http from 'http';
import killPort from 'kill-port';

import app from '~/app';

const envs: { [env: string]: string } = {
  test: '.env.test',
  dev: '.env.dev',
  development: '.env.dev',
  prod: '.env.prod',
  production: '.env.prod',
};
const env: string = process.env.NODE_ENV || 'dev';
require('dotenv').config({
  path: envs[env],
});

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
  server.listen(port, () => console.log(`Server running on port ${port}`));
});

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

export default async (): Promise<void> => {
  // empty
};

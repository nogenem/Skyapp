import dotenv from 'dotenv';

const envs: { [env: string]: string } = {
  test: '.env',
  development: '.env',
  production: '.env.prod',
};
const env: string = process.env.NODE_ENV || 'development';
dotenv.config({
  path: envs[env],
});

export default async (): Promise<void> => {
  // empty
};

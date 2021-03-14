declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: number;

      MONGO_URI: string;
      JWT_SECRET: string;

      EMAIL_HOST?: string;
      EMAIL_PORT?: number;
      EMAIL_USER: string;
      EMAIL_PASS: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};

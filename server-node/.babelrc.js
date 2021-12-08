module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    [
      'babel-plugin-root-import',
      {
        paths: [
          {
            rootPathPrefix: '~/',
            rootPathSuffix: 'src/',
          },
          {
            rootPathPrefix: '~t/',
            rootPathSuffix: '__tests__/',
          },
        ],
      },
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
  ],
};

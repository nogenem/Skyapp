const { alias, configPaths } = require('react-app-rewire-alias');

const { useBabelRc } = require('customize-cra');
const os = require('os');

// PS: I really hate everyone on create-react-app' team...
Object.defineProperty(os, 'EOL', { value: '\n' });

// https://github.com/oklas/react-app-rewire-alias/issues/1
module.exports = function override(config) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc()(config);

  alias({
    ...configPaths('tsconfig.paths.json'),
  })(config);
  return config;
};

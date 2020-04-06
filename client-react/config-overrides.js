const { alias, configPaths } = require("react-app-rewire-alias");

const { useBabelRc } = require("customize-cra");

// https://github.com/oklas/react-app-rewire-alias/issues/1
module.exports = function override(config) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc()(config);

  alias({
    ...configPaths("tsconfig.paths.json"),
  })(config);
  return config;
};

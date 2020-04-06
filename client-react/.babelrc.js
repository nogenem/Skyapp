module.exports = {
  plugins: [
    [
      "babel-plugin-root-import",
      { rootPathPrefix: "~", rootPathSuffix: "src" },
    ],
    [
      "babel-plugin-transform-imports",
      {
        "@material-ui/core": {
          // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
          transform: (importName) =>
            process.env.NODE_ENV === "test"
              ? `@material-ui/core/${importName}`
              : `@material-ui/core/esm/${importName}`,
          preventFullImport: true,
        },
        "@material-ui/icons": {
          // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
          transform: (importName) =>
            process.env.NODE_ENV === "test"
              ? `@material-ui/icons/${importName}`
              : `@material-ui/icons/esm/${importName}`,
          preventFullImport: true,
        },
      },
    ],
  ],
};

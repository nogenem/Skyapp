module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    [
      "babel-plugin-root-import",
      {
        rootPathPrefix: "~/",
        rootPathSuffix: "src/",
      },
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime",
  ],
};

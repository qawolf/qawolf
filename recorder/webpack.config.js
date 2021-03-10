const VirtualModulesPlugin = require("webpack-virtual-modules");
const path = require("path");
const injectedScriptSource = require("playwright-core/lib/generated/injectedScriptSource");

const virtualModules = new VirtualModulesPlugin({
  "node_modules/playwright-evaluator.js": `
  let pwQuerySelector;
  (() => {
    ${injectedScriptSource.source}
    const injected = new pwExport([]);
    pwQuerySelector = (selector, root) => {
      const parsed = injected.parseSelector(selector);
      return injected.querySelector(parsed, root);
    };
  })();
  module.exports = { querySelector: pwQuerySelector };`,
});

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            declaration: false,
          },
        },
        test: /\.tsx?$/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
  },
  output: {
    filename: "qawolf.recorder.js",
    library: "qawolf",
    libraryTarget: "window",
    path: path.resolve(__dirname, "./build"),
  },
  plugins: [virtualModules],
};

const util = require("util");
const webpack = require("webpack");
const webpackConfig = require("../../webpack.config");
webpackConfig.optimization.minimize = false;

/**
 * Global setup. Runs once per Jest run, before any tests run.
 */
module.exports = async () => {
  // Init webpack
  const compiler = webpack(webpackConfig);

  // Build the output file
  const run = util.promisify(compiler.run.bind(compiler));
  await run();

  // File contents will be read in `test/utils.js`
};

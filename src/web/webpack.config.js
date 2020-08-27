const VirtualModulesPlugin = require('webpack-virtual-modules');
const path = require('path');
const selectorEvaluatorSource = require('playwright-core/lib/generated/injectedScriptSource');

const virtualModules = new VirtualModulesPlugin({
  'node_modules/playwright-evaluator.js': `
  const evaluator = new (${selectorEvaluatorSource.source})([]);
  const createTextSelector = (element) => evaluator.engines.get('text').create(document, element);
  const isVisible = (element) => evaluator.isVisible(element);
  const querySelector = (...args) => evaluator.querySelector(...args);
  module.exports = { createTextSelector, isVisible, querySelector };`,
});

module.exports = {
  entry: './src/web/index.ts',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
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
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: 'qawolf.web.js',
    library: 'qawolf',
    libraryTarget: 'window',
    path: path.resolve(__dirname, '../../build'),
  },
  plugins: [virtualModules],
};

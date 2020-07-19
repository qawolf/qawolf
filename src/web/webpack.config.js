const VirtualModulesPlugin = require('webpack-virtual-modules');
const path = require('path');
const selectorEvaluatorSource = require('playwright-core/lib/generated/injectedScriptSource');

const virtualModules = new VirtualModulesPlugin({
  'node_modules/playwright-evaluator.js': `
  const evaluator = new (${selectorEvaluatorSource.source})([]);
  const isVisible = (element) => evaluator.isVisible(element);
  const querySelectorAll = (...args) => evaluator.querySelectorAll(...args);
  module.exports = { isVisible, querySelectorAll };`,
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

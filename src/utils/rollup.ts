/* eslint-disable */

import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/web/index.ts',
  output: {
    file: './build/playwrightutils.web.js',
    format: 'iife',
    name: 'playwrightutils',
    strict: false,
  },
  onwarn: (warning, next) => {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    next(warning);
  },
  plugins: [commonjs(), nodeResolve({ browser: true }), typescript()],
};

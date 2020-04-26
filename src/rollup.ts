/* eslint-disable */

import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/web/index.ts',
  output: {
    file: './build/qawolf.web.js',
    format: 'iife',
    name: 'qawolf',
    strict: false,
  },
  onwarn: (warning, next) => {
    if (warning.code === 'EVAL') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    next(warning);
  },
  plugins: [commonjs(), nodeResolve({ browser: true }), json(), typescript()],
};

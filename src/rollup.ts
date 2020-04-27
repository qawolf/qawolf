/* eslint-disable */

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
// having issues with @rollup/plugin-typescript
// consider moving to webpack instead of changing
import typescript from 'rollup-plugin-typescript';

import * as selectorEvaluatorSource from 'playwright-core/lib/generated/selectorEvaluatorSource';

const playwrightEvaluator = `
const evaluator = new (${selectorEvaluatorSource.source})([]);
export const querySelectorAll = (...args) => evaluator.querySelectorAll(...args);
`;

export default {
  input: './src/web/index.ts',
  output: {
    file: './build/qawolf.web.js',
    format: 'iife',
    name: 'qawolf',
    sourcemap: true,
    strict: false,
  },
  onwarn: (warning, next) => {
    if (warning.code === 'EVAL') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    next(warning);
  },
  plugins: [
    virtual({
      './playwrightEvaluator': playwrightEvaluator,
    }),
    commonjs(),
    nodeResolve({ browser: true }),
    typescript({ declaration: false }),
    json(),
  ],
};

#!/usr/bin/env node
import {
  launch,
  repl,
  saveState,
  scroll,
  setState,
  waitForPage,
} from 'playwright-utils';
import { create } from './create-code/create';
import { register } from './register';

const isCLI = !module.parent;
if (isCLI) {
  require('./cli/cli');
}

// export public API
export {
  create,
  launch,
  register,
  repl,
  saveState,
  scroll,
  setState,
  waitForPage,
};

// make repl a global
(global as any).repl = repl;

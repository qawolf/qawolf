#!/usr/bin/env node
import {
  launch,
  repl,
  ReplContext,
  register,
  saveState,
  scroll,
  setState,
  stopVideos,
  waitForPage,
} from 'playwright-utils';
import { create } from './create-code/create';

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
  stopVideos,
  waitForPage,
};

// set qawolf on repl context
ReplContext.set('qawolf', {
  launch,
  register,
  repl,
  saveState,
  stopVideos,
  scroll,
  setState,
  waitForPage,
});

// make repl a global
(global as any).repl = repl;

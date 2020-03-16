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
const qawolf = {
  create,
  launch,
  register,
  repl,
  saveState,
  stopVideos,
  scroll,
  setState,
  waitForPage,
};

// TODO after next playwright-utils release
// support: import qawolf from "qawolf"
// export default qawolf;

// support: const qawolf = require("qawolf");
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
ReplContext.set('qawolf', qawolf);

// make repl a global
(global as any).repl = repl;

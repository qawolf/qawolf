#!/usr/bin/env node
import { create } from './create-code/create';

import {
  launch,
  repl,
  register,
  Registry,
  saveState,
  scroll,
  setState,
  stopVideos,
  waitForPage,
} from './utils';

if (!module.parent) {
  // run the cli when this is the root module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { runCli } = require('./cli/cli');
  runCli();
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

// types for config
export {
  BuildTemplateOptions,
  TemplateFunction,
} from './build-code/buildTemplate';
export { Config } from './config';

// support: import qawolf from "qawolf"
export default qawolf;

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
Registry.set('qawolf', qawolf);

// make repl a global
(global as any).repl = repl;

#!/usr/bin/env node

import * as qawolf from './qawolf';
import { Registry } from './utils';

// support: const qawolf = require("qawolf");
// support: import { ... } from "qawolf";
export * from './qawolf';

// support: import qawolf from "qawolf"
export default qawolf;

// must do this here to prevent circular dependency
Registry.instance().setQawolf(qawolf);

if (!module.parent) {
  // run the cli when this is the root module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { runCli } = require('./cli/cli');
  runCli();
}

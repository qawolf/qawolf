#!/usr/bin/env node
import { repl } from 'playwright-utils';
import updateNotifier from 'update-notifier';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const isCLI = !module.parent;
if (isCLI) {
  updateNotifier({ pkg }).notify();

  require('./cli/cli');
}

// export public API
import { create } from './create-code/create';
export { create, repl };

// make repl a global
(global as any).repl = repl;

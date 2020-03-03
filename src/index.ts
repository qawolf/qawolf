#!/usr/bin/env node
import updateNotifier from 'update-notifier';

const pkg = require('../package.json');

const isCLI = !module.parent;
if (isCLI) {
  updateNotifier({ pkg }).notify();

  require('./cli/cli');
}

// TODO
// export public API
// export { BrowserContext, launch, Page } from '@qawolf/browser';

// export { repl } from '@qawolf/repl';

// export { sleep, waitFor, waitUntil } from '@qawolf/web';

// // make repl a global
// import { repl } from '@qawolf/repl';
// (global as any).repl = repl;

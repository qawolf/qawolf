#!/usr/bin/env node
import { launch, repl } from 'playwright-utils';
import { create } from './create-code/create';

const isCLI = !module.parent;
if (isCLI) {
  require('./cli/cli');
}

// export public API
export { create, launch, repl };

// make repl a global
(global as any).repl = repl;

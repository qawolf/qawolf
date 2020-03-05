#!/usr/bin/env node
import { launch, repl } from 'playwright-utils';

const isCLI = !module.parent;
if (isCLI) {
  require('./cli/cli');
}

// export public API
import { create } from './create-code/create';

// TODO launch
export { create, launch, repl };

// make repl a global
(global as any).repl = repl;

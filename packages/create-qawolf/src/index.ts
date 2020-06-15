#!/usr/bin/env node
import { create } from './create';

const isCLI = !module.parent;
if (isCLI) {
  create();
}

export { promptOverwrite } from './cli';

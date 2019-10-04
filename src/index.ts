#!/usr/bin/env node

import { Browser } from "./browser/Browser";
import * as hooks from "./browser/hooks";

export { Browser, hooks };

const runningAsScript = !module.parent;
if (runningAsScript) {
  require("./cli");
}

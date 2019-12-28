#!/usr/bin/env node

const isCLI = !module.parent;
if (isCLI) {
  require("@qawolf/cli");
}

// export public API
export { Browser, launch, LaunchOptions, Page } from "@qawolf/browser";
export { sleep, waitFor, waitUntil } from "@qawolf/web";

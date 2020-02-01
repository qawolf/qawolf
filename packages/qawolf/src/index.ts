#!/usr/bin/env node

const isCLI = !module.parent;
if (isCLI) {
  require("@qawolf/cli");
}

// export public API
export {
  BrowserContext,
  connect,
  ConnectOptions,
  launch,
  LaunchOptions,
  Page
} from "@qawolf/browser";

export { pause } from "@qawolf/repl";

export { sleep, waitFor, waitUntil } from "@qawolf/web";

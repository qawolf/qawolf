#!/usr/bin/env node
import updateNotifier from "update-notifier";

const pkg = require("../package.json");

const isCLI = !module.parent;
if (isCLI) {
  updateNotifier({ pkg }).notify();

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

export { repl } from "@qawolf/repl";

export { sleep, waitFor, waitUntil } from "@qawolf/web";

// make repl a global
import { repl } from "@qawolf/repl";
(global as any).repl = repl;

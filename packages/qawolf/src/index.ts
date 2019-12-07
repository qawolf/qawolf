#!/usr/bin/env node

// run cli
import "@qawolf/cli";

// export public API
export {
  // Browser
  Browser,
  launch,
  LaunchOptions,
  // page
  Page
} from "@qawolf/browser";

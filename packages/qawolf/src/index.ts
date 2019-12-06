#!/usr/bin/env node

// run cli
import "@qawolf/cli";

// export public API
export {
  // actions
  click,
  Browser,
  scroll,
  select,
  type,
  // find
  findProperty,
  hasText,
  // Browser
  close,
  launch
} from "@qawolf/browser";

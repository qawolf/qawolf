#!/usr/bin/env node

export * from "./api";

if (require.main === module) {
  // run the cli when this is the root module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { runCli } = require("./cli");
  runCli();
}

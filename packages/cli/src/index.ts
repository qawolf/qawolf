#!/usr/bin/env node

import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Workflow } from "@qawolf/types";
import program from "commander";
import { readJson } from "fs-extra";
import { snakeCase } from "lodash";
import { record } from "./record";
import { runTest } from "./runTest";
import { parseUrl, getUrlRoot } from "./utils";

let recordCommand = program
  .command("record <url> [name]")
  .description("record a workflow and create a test");

if (CONFIG.development) {
  recordCommand = recordCommand.option(
    "-e, --events",
    "record events (for debugging)"
  );
}

recordCommand.action(async (urlArgument, optionalName, cmd) => {
  const url = parseUrl(urlArgument);
  logger.verbose(`record url "${url.href}"`);

  const name = snakeCase(optionalName || getUrlRoot(url));
  await record(url, name, cmd.events);
});

program
  .command("run [name]")
  .description("run a workflow")
  .action(async name => {
    const workflowPath = `${process.cwd()}/.qawolf/workflows/${snakeCase(
      name
    )}.json`;
    const workflow = (await readJson(workflowPath)) as Workflow;
    const runner = await Runner.create(workflow);

    await runner.run();
    await runner.close();

    process.exit(0);
  });

program
  .command("test [name]")
  .description("run a test")
  .action(async name => {
    const results = await runTest(name ? snakeCase(name) : null);
    const success = results.numFailedTestSuites < 1;
    process.exit(success ? 0 : 1);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

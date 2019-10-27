#!/usr/bin/env node

import { buildTest } from "@qawolf/build-test";
import { Browser } from "@qawolf/browser";
import { buildWorkflow } from "@qawolf/build-workflow";
import { CONFIG } from "@qawolf/config";
import { createCheckRun, updateCheckRun } from "@qawolf/github";
import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Workflow } from "@qawolf/types";
import program from "commander";
import { outputFile, outputJson, readJson } from "fs-extra";
import { snakeCase } from "lodash";
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
  const name = optionalName || getUrlRoot(url);
  logger.verbose(`record url "${url.href}"`);

  const browser = await Browser.create({ record: true, url: url.href });
  await browser.waitForClose();

  const destPath = `${process.cwd()}/.qawolf`;
  const formattedName = snakeCase(name);

  if (cmd.events) {
    // save events
    const destEventsPath = `${destPath}/events/${formattedName}.json`;
    logger.verbose(`save events "${name}" -> ${destEventsPath}`);
    await outputJson(destEventsPath, browser.events, { spaces: " " });
  } else {
    // save workflow
    const destWorkflowPath = `${destPath}/workflows/${formattedName}.json`;
    logger.verbose(`save workflow -> ${destWorkflowPath}`);
    const workflow = buildWorkflow({
      events: browser.events,
      name: formattedName,
      url: url.href!
    });
    await outputJson(destWorkflowPath, workflow, { spaces: " " });

    // save test
    const destTestPath = `${destPath}/tests/${formattedName}.test.js`;
    logger.verbose(`save test -> ${destTestPath}`);
    const test = buildTest(workflow);
    await outputFile(destTestPath, test, "utf8");
  }

  process.exit(0);
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
    const checkRunId = await createCheckRun();

    const results = await runTest(name ? snakeCase(name) : null);
    const success = results.numFailedTestSuites < 1;

    if (checkRunId) {
      await updateCheckRun(checkRunId, results);
    }

    process.exit(success ? 0 : 1);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

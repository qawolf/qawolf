#!/usr/bin/env node

import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { yellow } from "kleur";
import program from "commander";
import { snakeCase } from "lodash";
import { saveCiTemplate } from "./ci";
import { record } from "./record";
import { test } from "./test";
import { parseUrl } from "./utils";
const { version } = require("../package");

program.version(version);

program.usage("<command> [options]");

let recordCommand = program
  .command("record <url> [name]")
  .description("record a workflow and create a test");

if (CONFIG.development) {
  recordCommand = recordCommand.option(
    "-e, --events",
    "save events (for debugging)"
  );
}

recordCommand.action(async (urlArgument, optionalName, cmd) => {
  const url = parseUrl(urlArgument);
  logger.verbose(`record url "${url.href}"`);

  const name = snakeCase(optionalName || url.hostname!);
  await record(url, name, cmd.events);
});

program
  .command("test [name]")
  .description("run a test")
  .action(async optionalName => {
    await test(optionalName);
  });

program
  .command("azure")
  .description("set up an Azure Pipeline")
  .action(async () => {
    await saveCiTemplate("azure");
  });

program
  .command("circleci")
  .description("set up CircleCI")
  .action(async () => {
    await saveCiTemplate("circleci");
  });

program
  .command("github")
  .description("set up a GitHub Action")
  .action(async () => {
    await saveCiTemplate("github");
  });

program
  .command("gitlab")
  .description("set up GitLab CI/CD")
  .action(async () => {
    await saveCiTemplate("gitlab");
  });

program.arguments("<command>").action(cmd => {
  console.log(yellow(`Invalid command "${cmd}"\n`));
  program.help();
});

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

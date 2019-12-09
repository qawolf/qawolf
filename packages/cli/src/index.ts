#!/usr/bin/env node

import { logger } from "@qawolf/logger";
import program from "commander";
import { yellow } from "kleur";
import { camelCase } from "lodash";
import { saveCiTemplate } from "./ci";
import { record } from "./record";
import { test } from "./test";
import { parseUrl } from "./utils";
const { version } = require("../package");

program.version(version);

program.usage("<command> [options]");

program
  .command("record <url> [name]")
  .option("-d, --debug", "save events and workflow json for debugging")
  .option("-s, --script", "save a script instead of a test")
  .description("record a workflow and create a test")
  .action(async (urlArgument, optionalName, cmd) => {
    const url = parseUrl(urlArgument);
    logger.verbose(`record url "${url.href}"`);

    const name = camelCase(optionalName || url.hostname!.replace(/\..*/g, ""));
    await record({ debug: cmd.debug, name, test: !cmd.script, url });
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

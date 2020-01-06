#!/usr/bin/env node

import { logger } from "@qawolf/logger";
import program from "commander";
import { yellow } from "kleur";
import { camelCase } from "lodash";
import * as updateNotifier from "update-notifier";
import { saveCiTemplate } from "./ci";
import { create } from "./create";
import { howl } from "./howl";
import { test } from "./test";
import { parseUrl } from "./utils";
const pkg = require("../package");

updateNotifier({ pkg }).notify();

program.usage("<command> [options]").version(pkg.version);

program
  .command("create <url> [name]")
  .option("--debug", "save events and workflow json for debugging")
  .option("-d, --device <device>", "emulate using a puppeteer.device")
  .option("-s, --script", "create a script instead of a test")
  .description("create a test from browser actions")
  .action(async (urlArgument, optionalName, cmd) => {
    const url = parseUrl(urlArgument);
    logger.verbose(`record url "${url.href}"`);

    const name = camelCase(optionalName || url.hostname!.replace(/\..*/g, ""));
    await create({
      debug: cmd.debug,
      device: cmd.device,
      name,
      test: !cmd.script,
      url
    });
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

program
  .command("howl")
  .description("🐺")
  .action(howl);

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

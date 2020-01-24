#!/usr/bin/env node

import { logger } from "@qawolf/logger";
import program from "commander";
import { red, yellow } from "kleur";
import { camelCase } from "lodash";
import updateNotifier from "update-notifier";
import { saveCiTemplate } from "./ci";
import { create } from "./create";
import { howl } from "./howl";
import { runJest } from "./runJest";
import { omitArgs, parseUrl } from "./utils";
const pkg = require("../package");

updateNotifier({ pkg }).notify();

program.usage("<command> [options]").version(pkg.version);

program
  .command("create <url> [name]")
  // XXX remove in v1.0.0
  .alias("record")
  .option("--debug", "save events and workflow json for debugging")
  .option("-d, --device <device>", "emulate using a playwright.device")
  .option("-p, --path <path>", "path to save the file")
  .option("-s, --script", "create a script instead of a test")
  .description("create a test from browser actions")
  .action(async (urlArgument, optionalName, cmd) => {
    if (process.argv[2] === "record") {
      console.log(
        red(
          `"qawolf record" will be removed in v1.0.0\nPlease use "qawolf create" instead`
        )
      );
    }
    const url = parseUrl(urlArgument);
    logger.verbose(`create "${url.href}"`);

    const name = camelCase(optionalName || url.hostname!.replace(/\..*/g, ""));
    await create({
      debug: cmd.debug,
      device: cmd.device,
      name,
      path: cmd.path,
      test: !cmd.script,
      url
    });
  });

program
  .command("test")
  .option("-p, --path <path>", "path to test code")
  .description("run a test with Jest")
  .allowUnknownOption(true)
  .action(cmd => {
    const args = omitArgs(process.argv.slice(3), ["-p", "--path"]);

    const code = runJest(args, {
      path: cmd.path
    });
    process.exit(code);
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

program
  .command("jenkins")
  .description("set up Jenkins")
  .action(async () => {
    await saveCiTemplate("jenkins");
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

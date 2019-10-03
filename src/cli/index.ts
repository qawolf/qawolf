#!/usr/bin/env node

import clear from "clear";
import program from "commander";
import fs, { ensureDir, writeJson } from "fs-extra";
import { snakeCase } from "lodash";
import path from "path";
import { BrowserRunner } from "../browser/BrowserRunner";
import { renderCli } from "../callbacks/cli";
import { buildScreenshotCallback } from "../callbacks/screenshot";
import { CONFIG } from "../config";
import { logger } from "../logger";
import { planJob } from "../planner";

clear();

program
  .command("plan <eventsPath> <name>")
  .description("plan a job from events")
  .action(async (eventsPath, name) => {
    const sourcePath = path.resolve(eventsPath);
    const destDir = `${process.cwd()}/.qawolf/jobs`;
    const formattedName = snakeCase(name);
    const destPath = `${destDir}/${formattedName}.json`;

    logger.debug(`plan job ${sourcePath} -> ${destPath}`);
    const events = await fs.readJson(sourcePath);

    const job = planJob(events, formattedName);

    await ensureDir(destDir);
    await writeJson(destPath, job, { spaces: " " });

    process.exit(0);
  });

program
  .command("run <name>")
  .description("run a job")
  .action(async name => {
    const jobPath = `${process.cwd()}/.qawolf/jobs/${name}.json`;

    logger.debug(`run job ${jobPath}`);
    const job = await fs.readJson(jobPath);

    const callbacks = {
      beforeStep: [renderCli],
      afterStep: [renderCli],
      afterRun: [renderCli]
    };

    if (CONFIG.screenshotPath) {
      const takeScreenshot = buildScreenshotCallback(1000);
      callbacks.beforeStep.unshift(takeScreenshot);
      callbacks.afterRun.unshift(takeScreenshot);
    }

    const runner = new BrowserRunner({ callbacks });

    try {
      await runner.run(job);
      await runner.close();
    } catch (e) {
      logger.error(`error running job: ${e}`);
      process.exit(1);
      return;
    }

    process.exit(0);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

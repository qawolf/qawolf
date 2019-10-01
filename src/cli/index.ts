#!/usr/bin/env node

import clear from "clear";
import program from "commander";
import fs, { ensureDir, writeJson } from "fs-extra";
import path from "path";
import { BrowserRunner } from "../browser/BrowserRunner";
import { renderCli } from "../callbacks/cli";
import { buildScreenshotCallback } from "../callbacks/screenshot";
import { logger } from "../logger";
import { planJob } from "../planner";

clear();

program
  .command("plan <eventsPath> <name>")
  .description("plan a job from events")
  .action(async (eventsPath, name) => {
    const sourcePath = path.resolve(eventsPath);
    const destDir = `${process.cwd()}/.qawolf/jobs`;
    const destPath = `${destDir}/${name}.json`;

    logger.debug(`plan job ${sourcePath} -> ${destPath}`);
    const events = await fs.readJson(sourcePath);

    const job = planJob(events);

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

    const takeScreenshot = buildScreenshotCallback(1000);

    const callbacks = {
      beforeStep: [takeScreenshot, renderCli],
      afterStep: [renderCli],
      afterRun: [takeScreenshot, renderCli]
    };

    const runner = new BrowserRunner({ callbacks });
    await runner.run(job);

    await runner.close();

    process.exit(0);
  });

program.parse(process.argv);

#!/usr/bin/env node

import clear from "clear";
import program from "commander";
import fs from "fs-extra";
import { BrowserRunner } from "./BrowserRunner";
import { Server } from "./browser/Server";
import { renderCli } from "./callbacks/cli";
import { buildScreenshotCallback } from "./callbacks/screenshot";
import { planJob } from "./planner";
import { loginJob } from "./fixtures/job";

clear();

program
  .command("run <source>")
  .description("run a test")
  .action(async source => {
    let job = loginJob;
    if (source) {
      const events = JSON.parse(await fs.readFile(source, "utf8"));
      job = planJob(events);
    }

    const server = new Server();
    await server.listen();

    const takeScreenshot = buildScreenshotCallback(1000);

    const callbacks = {
      beforeStep: [takeScreenshot, renderCli],
      afterStep: [renderCli],
      afterRun: [takeScreenshot, renderCli]
    };

    const runner = new BrowserRunner({ callbacks, server });
    await runner.run(job);

    await runner.close();

    process.exit(0);
  });

program.parse(process.argv);

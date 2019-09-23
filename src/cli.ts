#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import program from "commander";
import figlet from "figlet";
import fs from "fs-extra";
import { BrowserRunner } from "./BrowserRunner";
import { Server } from "./io/Server";
import { buildScreenshotCallback } from "./screenshot";
import { planJob } from "./planner";

clear();

console.log(
  chalk.green(figlet.textSync("qawolf", { horizontalLayout: "full" }))
);

program.version("0.0.1").description("Effortless smoke tests");

program
  .command("run <source>")
  .description("run a test")
  .action(async source => {
    const events = JSON.parse(await fs.readFile(source, "utf8"));
    const job = planJob(events);
    const server = new Server();
    await server.listen();

    const takeScreenshot = buildScreenshotCallback(1000);

    const callbacks = {
      beforeStep: [takeScreenshot],
      afterRun: [takeScreenshot]
    };

    const runner = new BrowserRunner({ callbacks, server });
    await runner.run(job);

    await runner.close();
  });

program.parse(process.argv);

program.outputHelp();

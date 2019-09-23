#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import program from "commander";
import figlet from "figlet";
import fs from "fs-extra";
import { BrowserRunner } from "./BrowserRunner";
import { Server } from "./io/Server";
import { planJob } from "./planner";

clear();

console.log(
  chalk.green(figlet.textSync("qawolf", { horizontalLayout: "full" }))
);

program.version("0.0.1").description("Effortless smoke tests");

program
  .command("run <source> [destination]")
  .description("run a test")
  .action(async (source, destination) => {
    const events = JSON.parse(await fs.readFile(source, "utf8"));
    const job = planJob(events);

    const server = new Server();
    const runner = new BrowserRunner({ server });

    await runner.run(job);
  });

program.parse(process.argv);

program.outputHelp();

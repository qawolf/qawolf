#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import program from "commander";
import figlet from "figlet";
import fs from "fs-extra";
import { Runner } from "./Runner";
import { Server } from "./io/Server";
import { planWorkflow } from "./planner";

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
    const workflow = planWorkflow(events);

    console.log("workflow", workflow);

    const server = new Server();
    const runner = new Runner(server);

    await runner.run(workflow);
  });

program.parse(process.argv);

program.outputHelp();

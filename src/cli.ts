#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import program from "commander";

clear();

console.log(
  chalk.green(figlet.textSync("qawolf", { horizontalLayout: "full" }))
);

program.version("0.0.1").description("Effortless acceptance tests");

program
  .command("run <source> [destination]")
  .description("run a test")
  .action((source, destination) => {
    console.log("to do");
  });

program.parse(process.argv);

program.outputHelp();

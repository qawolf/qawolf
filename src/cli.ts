#!/usr/bin/env node

import clear from "clear";
import program from "commander";
import fs, { ensureDir, writeFile } from "fs-extra";
import { runCLI } from "jest";
import { snakeCase } from "lodash";
import path from "path";
import { logger } from "./logger";
import { buildJob } from "./build/buildJob";
import { buildTest } from "./build/buildTest";

clear();

program
  .command("build <eventsPath> <name>")
  .description("build a test from events")
  .action(async (eventsPath, name) => {
    const sourcePath = path.resolve(eventsPath);
    const destDir = `${process.cwd()}/.qawolf/__tests__`;
    const formattedName = snakeCase(name);
    const destPath = `${destDir}/${formattedName}.js`;

    logger.debug(`build test for ${sourcePath} -> ${destPath}`);
    const events = await fs.readJson(sourcePath);
    const job = buildJob(events, formattedName);
    const test = buildTest(job);

    await ensureDir(destDir);
    await writeFile(destPath, test, "utf8");

    process.exit(0);
  });

program
  .command("run [name]")
  .description("run a test")
  .action(async name => {
    // project root is where qawolf is called from
    const projectRootPath = process.cwd();

    // TODO filter by test name
    const jestConfig = {
      roots: ["<rootDir>/.qawolf"]
    };

    await runCLI(jestConfig as any, [projectRootPath]);

    // TODO change exit code based on results
    process.exit(0);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

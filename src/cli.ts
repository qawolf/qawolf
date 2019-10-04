import clear from "clear";
import program from "commander";
import fs, { outputFile } from "fs-extra";
import { snakeCase } from "lodash";
import { resolve } from "path";
import { buildJob } from "./build/buildJob";
import { buildTest } from "./build/buildTest";
import { logger } from "./logger";
import { runTest } from "./runTest";

clear();

program
  .command("build <eventsPath> <name>")
  .description("build a test from events")
  .action(async (eventsPath, name) => {
    const sourcePath = resolve(eventsPath);
    const formattedName = snakeCase(name);
    const destPath = `${process.cwd()}/.qawolf/__tests__/${formattedName}.js`;

    logger.debug(`build test for ${sourcePath} -> ${destPath}`);
    const events = await fs.readJson(sourcePath);
    const job = buildJob(events, formattedName);
    const test = buildTest(job);
    await outputFile(destPath, test, "utf8");

    process.exit(0);
  });

program
  .command("run [name]")
  .description("run a test")
  .action(async name => {
    const success = await runTest(name ? snakeCase(name) : undefined);
    process.exit(success ? 0 : 1);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

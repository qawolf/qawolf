import clear from "clear";
import program from "commander";
import fs, { ensureDir, writeFile } from "fs-extra";
import { runCLI } from "jest";
import { snakeCase } from "lodash";
import path from "path";
import { buildJob } from "./build/buildJob";
import { buildTest } from "./build/buildTest";
import { logger } from "./logger";

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
    // `qawolf run` should be called where .qawolf is
    const rootDir = process.cwd();

    const jestConfig: any = {
      roots: ["<rootDir>/.qawolf"],
      testTimeout: 30000
    };
    if (name) {
      jestConfig._ = [`${snakeCase(name)}.js`];
    }

    const output = await runCLI(jestConfig, [rootDir]);
    const failed = output.results.numFailedTestSuites > 0;
    process.exit(failed ? 1 : 0);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

import { buildJob } from "@qawolf/build-job";
import { buildTest } from "@qawolf/build-test";
import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Job } from "@qawolf/types";
import program from "commander";
import { outputFile, outputJson, readJson } from "fs-extra";
import { snakeCase } from "lodash";
import { resolve } from "path";
import { runTest } from "./runTest";

program
  .command("build <eventsPath> <name>")
  .description("build a test from events")
  .action(async (eventsPath, name) => {
    const sourcePath = resolve(eventsPath);
    logger.verbose(`read events from ${sourcePath}`);
    const events = await readJson(sourcePath);

    const destPath = `${process.cwd()}/.qawolf`;
    const formattedName = snakeCase(name);
    const destJobPath = `${destPath}/jobs/${formattedName}.json`;
    const destTestPath = `${destPath}/tests/${formattedName}.test.js`;

    logger.verbose(`build job -> ${destTestPath}`);
    const job = buildJob(events, formattedName);
    await outputJson(destJobPath, job, { spaces: " " });

    logger.verbose(`build test -> ${destTestPath}`);
    const test = buildTest(job);
    await outputFile(destTestPath, test, "utf8");

    process.exit(0);
  });

program
  .command("run [name]")
  .description("run a job")
  .action(async name => {
    const jobPath = `${process.cwd()}/.qawolf/jobs/${snakeCase(name)}.json`;
    const job = (await readJson(jobPath)) as Job;
    const runner = await Runner.create(job);

    await runner.run();
    await runner.close();

    process.exit(0);
  });

program
  .command("test [name]")
  .description("run a test")
  .action(async name => {
    const success = await runTest(name ? snakeCase(name) : null);
    process.exit(success ? 0 : 1);
  });

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log("\n");
  program.outputHelp();
}

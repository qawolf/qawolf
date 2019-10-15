import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Job } from "@qawolf/types";
import { EnvironmentContext } from "@jest/environment";
import { Config } from "@jest/types";
import { readJSON } from "fs-extra";
import NodeEnvironment from "jest-environment-node";
import path from "path";

const loadJob = async (testPath: string) => {
  const testName = path.basename(testPath).split(".")[0];
  // the job should be in a sibling folder ../jobs/testName.json
  const jobPath = path.join(
    path.dirname(testPath),
    "../jobs",
    `${testName}.json`
  );
  logger.verbose(`load job for test ${testPath} ${jobPath}`);
  const json = await readJSON(jobPath);
  return json as Job;
};

export class RunnerEnvironment extends NodeEnvironment {
  private _runner: Runner;
  private _testPath: string;

  constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
    super(config);
    this._testPath = context.testPath!;
  }

  async setup() {
    await super.setup();

    const job = await loadJob(this._testPath);
    const runner = await Runner.create(job);
    this.global.runner = this._runner = runner;

    this.global.click = runner.click.bind(runner);
    this.global.input = runner.input.bind(runner);
    this.global.scroll = runner.scroll.bind(runner);

    this.global.job = runner.job;
    this.global.steps = runner.job.steps;
    this.global.values = runner.values;

    const browser = runner.browser;
    this.global.browser = browser;
    this.global.currentPage = browser.currentPage.bind(browser);
    this.global.getPage = browser.getPage.bind(browser);
  }

  async teardown() {
    await Promise.all([this._runner.close(), super.teardown()]);
  }
}

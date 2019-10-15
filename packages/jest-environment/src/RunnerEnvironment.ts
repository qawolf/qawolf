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
  logger.debug(`load job for test ${testPath} ${jobPath}`);
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
    this._runner = await Runner.create(job);
    this.global.runner = this._runner;

    this.global.click = this._runner.click;
    this.global.input = this._runner.input;
    this.global.scroll = this._runner.scroll;

    this.global.job = this._runner.job;
    this.global.steps = this._runner.job.steps;
    this.global.values = this._runner.values;

    const browser = this._runner.browser;
    this.global.browser = browser;
    this.global.currentPage = browser.currentPage;
    this.global.getPage = browser.getPage;
  }

  async teardown() {
    await Promise.all([this._runner.close(), super.teardown()]);
  }
}

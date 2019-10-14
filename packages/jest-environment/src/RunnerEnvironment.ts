import { Runner } from "@qawolf/runner";
import { EnvironmentContext } from "@jest/environment";
import { Config } from "@jest/types";
import NodeEnvironment from "jest-environment-node";

const loadJobForTest = (path: string) => {};
// TODO loadValuesForTest

export class RunnerEnvironment extends NodeEnvironment {
  private _runner: Runner;
  private _testPath: string;

  constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
    super(config);
    this._testPath = context.testPath!;
  }

  async setup() {
    await super.setup();

    const job = await loadJobForTest(this._testPath);
    this._runner = await Runner.create(job);
    this.global.runner = this._runner;
    this.global.click = this._runner.click;
    this.global.input = this._runner.input;
    this.global.job = this._runner.job;
    this.global.steps = this._runner.steps;

    const browser = this._runner.browser;
    this.global.browser = browser;
    this.global.currentPage = browser.currentPage;
    this.global.getPage = browser.getPage;
  }

  async teardown() {
    await super.teardown();
    await this._runner.close();
  }
}

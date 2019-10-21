import { EnvironmentContext } from "@jest/environment";
import { Config } from "@jest/types";
import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Workflow } from "@qawolf/types";
import { readJSON } from "fs-extra";
import NodeEnvironment from "jest-environment-node";
import path from "path";

const loadWorkflow = async (testPath: string) => {
  const testName = path.basename(testPath).split(".")[0];
  // the workflow should be in a sibling folder ../workflows/testName.json
  const workflowPath = path.join(
    path.dirname(testPath),
    "../workflows",
    `${testName}.json`
  );
  logger.verbose(`load workflow for test ${testPath} ${workflowPath}`);
  const json = await readJSON(workflowPath);
  return json as Workflow;
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

    const workflow = await loadWorkflow(this._testPath);
    const runner = await Runner.create(workflow);
    this.global.runner = this._runner = runner;

    this.global.click = runner.click.bind(runner);
    this.global.input = runner.input.bind(runner);
    this.global.scroll = runner.scroll.bind(runner);

    this.global.steps = runner.workflow.steps;
    this.global.values = runner.values;
    this.global.workflow = runner.workflow;

    const browser = runner.browser;
    this.global.browser = browser;
    this.global.currentPage = browser.currentPage.bind(browser);
    this.global.getPage = browser.getPage.bind(browser);
  }

  async teardown() {
    await Promise.all([this._runner.close(), super.teardown()]);
  }
}

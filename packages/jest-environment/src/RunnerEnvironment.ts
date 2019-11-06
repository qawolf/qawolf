import { EnvironmentContext } from "@jest/environment";
import { Config } from "@jest/types";
import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Runner } from "@qawolf/runner";
import { Workflow } from "@qawolf/types";
import { waitUntil } from "@qawolf/web";
import { pathExists, readJSON } from "fs-extra";
import NodeEnvironment from "jest-environment-node";
import path from "path";

export class RunnerEnvironment extends NodeEnvironment {
  private _runner: Runner;
  private _testName: string;
  private _testPath: string;

  constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
    super(config);
    this._testPath = context.testPath!;
    this._testName = path.basename(this._testPath).split(".")[0];

    // set the name of the logger to the test
    logger.setName(this._testName);
  }

  async setup(): Promise<void> {
    logger.verbose("RunnerEnvironment: setup");
    await super.setup();

    const workflow = await this.loadWorkflow();
    if (!workflow) return;

    const runner = await Runner.create(workflow);
    this.global.runner = this._runner = runner;

    this.global.click = runner.click.bind(runner);
    this.global.findProperty = runner.findProperty.bind(runner);
    this.global.hasText = runner.hasText.bind(runner);
    this.global.scroll = runner.scroll.bind(runner);
    this.global.type = runner.type.bind(runner);

    this.global.steps = runner.workflow.steps;
    this.global.values = runner.values;

    // default timeoutMs to CONFIG
    this.global.waitUntil = (
      booleanFn: () => boolean,
      timeoutMs?: number,
      sleepMs?: number
    ) => waitUntil(booleanFn, timeoutMs || CONFIG.findTimeoutMs, sleepMs);

    this.global.workflow = runner.workflow;

    const browser = runner.browser;
    this.global.browser = browser;
    this.global.currentPage = browser.currentPage.bind(browser);
    this.global.getPage = browser.getPage.bind(browser);
  }

  async teardown(): Promise<void> {
    logger.verbose("RunnerEnvironment: teardown");

    const promises = [super.teardown()];

    // if there is a sleep ms, wait after the last step
    await new Promise(resolve => setTimeout(resolve, CONFIG.sleepMs));

    if (this._runner) {
      promises.push(this._runner.close());
    }

    await Promise.all(promises);

    // give logs time to output
    await new Promise(resolve => setTimeout(resolve, 100));

    if (CONFIG.debug) {
      // stay open
      await new Promise(resolve => setTimeout(resolve, 24 * 60 * 1000));
    }
  }

  private async loadWorkflow(): Promise<Workflow | null> {
    // the workflow should be in a sibling folder ../workflows/testName.json
    const workflowPath = path.join(
      path.dirname(this._testPath),
      "../workflows",
      `${this._testName}.json`
    );

    const hasWorkflowPath = await pathExists(workflowPath);
    if (!hasWorkflowPath) {
      logger.verbose(
        `RunnerEnvironment: test ${this._testPath} not found in workflows directory`
      );
      return null;
    }

    logger.verbose(
      `RunnerEnvironment: load workflow for test ${this._testPath} ${workflowPath}`
    );
    const json = await readJSON(workflowPath);
    return json as Workflow;
  }
}

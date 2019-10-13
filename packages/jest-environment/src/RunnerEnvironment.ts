import { EnvironmentContext } from "@jest/environment";
import { Config } from "@jest/types";
import NodeEnvironment from "jest-environment-node";

export class RunnerEnvironment extends NodeEnvironment {
  constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
    super(config);
    console.log("testPath", context.testPath);
  }

  async setup() {
    await super.setup();

    this.global.hello = "hello";
  }

  async teardown() {
    await super.teardown();
  }
}

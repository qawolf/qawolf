import { runCLI } from "jest";
import path from "path";

export const runTest = async (
  name?: string,
  rootDir: string = process.cwd()
) => {
  const modulePath = require.resolve("@qawolf/jest-environment");
  const setupFailFast = path.resolve(path.dirname(modulePath), "./setup.js");

  const jestConfig: any = {
    config: "{}",
    // assume .qawolf is relative to the current working directory
    roots: [`<rootDir>/.qawolf`],
    // run with fast fail since we do not want to continue e2e tests when one fails
    setupFilesAfterEnv: [setupFailFast],
    testEnvironment: modulePath,
    testTimeout: 30000
  };

  if (name) {
    jestConfig._ = [`${name}`];
  }

  const output = await runCLI(jestConfig, [rootDir]);
  const success = output.results.numFailedTestSuites < 1;
  return success;
};

import { AggregatedResult } from "@jest/test-result";
import { CONFIG } from "@qawolf/config";
import { runCLI } from "jest";
import path from "path";

export const runTest = async (
  name: string | null = null,
  rootDir: string = process.cwd()
): Promise<AggregatedResult> => {
  const modulePath = require.resolve("@qawolf/jest-environment");
  const setupFailFast = path.resolve(path.dirname(modulePath), "./setup.js");

  const jestConfig: any = {
    // 3
    clearCache: true,
    config: "{}",
    // assume .qawolf is relative to the current working directory
    roots: [`<rootDir>/.qawolf`],
    runInBand: CONFIG.serial,
    // run with fast fail since we do not want to continue e2e tests when one fails
    setupFilesAfterEnv: [setupFailFast],
    testEnvironment: modulePath,
    testTimeout: 60000
  };

  if (name) {
    jestConfig._ = [name];
  }

  const output = await runCLI(jestConfig, [rootDir]);

  return output.results;
};

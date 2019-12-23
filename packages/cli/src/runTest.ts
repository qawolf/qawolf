import { AggregatedResult } from "@jest/test-result";
import { CONFIG } from "@qawolf/config";
import { runCLI } from "jest";
import path from "path";

export const runTest = async (
  name: string | null = null,
  rootDir: string = process.cwd()
): Promise<AggregatedResult> => {
  const setupFailFast = path.join(
    __dirname,
    __dirname.includes("src") ? "../lib" : "",
    "failFast.js"
  );

  const jestConfig: any = {
    cache: false,
    // override transform to prevent using external babel-jest
    config: '{"transform": {}}',
    // assume .qawolf is relative to the current working directory
    roots: [`<rootDir>/.qawolf`],
    runInBand: CONFIG.serial,
    // run with fast fail since we do not want to continue e2e tests when one fails
    setupFilesAfterEnv: [setupFailFast],
    testTimeout: 60000
  };

  if (name) {
    jestConfig._ = [name];
  }

  const output = await runCLI(jestConfig, [rootDir]);

  return output.results;
};

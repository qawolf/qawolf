import { runCLI } from "jest";
import { resolve } from "path";

export const runTest = async (
  name?: string,
  rootDir: string = process.cwd()
) => {
  const failFastPath =
    __dirname.indexOf("dist") > -1
      ? // relative to dist
        resolve(__dirname, "./jest.failFast.js")
      : // relative to src
        resolve(__dirname, "../dist/jest.failFast.js");

  const jestConfig: any = {
    config: "{}",
    // assume .qawolf is relative to the current working directory
    roots: [`${rootDir}/.qawolf`],
    // run with fast fail since we do not want to continue e2e tests when one fails
    setupFilesAfterEnv: [failFastPath],
    testTimeout: 30000
  };

  if (name) {
    jestConfig._ = [`${name}.js`];
  }

  const output = await runCLI(jestConfig, [rootDir]);
  const success = output.results.numFailedTestSuites < 1;
  return success;
};

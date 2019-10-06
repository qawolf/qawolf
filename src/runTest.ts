import { runCLI } from "jest";
import { resolve } from "path";

export const runTest = async (
  name?: string,
  rootDir: string = process.cwd()
) => {
  const setupPath =
    __dirname.indexOf("dist") > -1
      ? // relative to dist
        resolve(__dirname, "./jest.setup.js")
      : // relative to src
        resolve(__dirname, "../dist/jest.setup.js");

  const jestConfig: any = {
    config: "{}",
    // assume .qawolf is relative to the current working directory
    roots: [`${rootDir}/.qawolf`],
    setupFilesAfterEnv: [setupPath],
    testTimeout: 30000
  };

  if (name) {
    jestConfig._ = [`${name}.js`];
  }

  const output = await runCLI(jestConfig, [rootDir]);
  const success = output.results.numFailedTestSuites < 1;
  return success;
};

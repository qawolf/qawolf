import { runCLI } from "jest";

export const runTest = async (
  name?: string,
  rootDir: string = process.cwd()
) => {
  // assume .qawolf is relative to the current working directory
  const jestConfig: any = {
    config: "{}",
    roots: [`${rootDir}/.qawolf`],
    testTimeout: 30000
  };
  if (name) {
    jestConfig._ = [`${name}.js`];
  }

  const output = await runCLI(jestConfig, [rootDir]);
  const success = output.results.numFailedTestSuites < 1;
  return success;
};

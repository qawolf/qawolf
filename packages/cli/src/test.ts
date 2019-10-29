import { snakeCase } from "lodash";
import { basename } from "path";
import { runTest } from "./runTest";
import { readdir } from "fs-extra";
import { prompt } from "inquirer";

export const test = async (optionalName?: string) => {
  const testPath = `${process.cwd()}/.qawolf/tests`;
  const availableTests = (await readdir(testPath)).map(f =>
    basename(
      f
        .replace(".test", "")
        .replace(".ts", "")
        .replace(".js", "")
    )
  );

  if (!availableTests.length) {
    console.log(`No tests found in ${testPath}`);
    return;
  }

  let testName: string | null = null;

  if (optionalName) {
    testName = snakeCase(optionalName);
    if (availableTests.indexOf(testName) < 0) {
      const { selectedName } = await prompt<{ selectedName: string }>([
        {
          choices: availableTests,
          message: `Test "${testName}" not found, select a test to run`,
          name: "selectedName",
          type: "list"
        }
      ]);

      testName = selectedName;
    }
  }

  const results = await runTest(testName);
  const success = results.numFailedTestSuites < 1;
  process.exit(success ? 0 : 1);
};

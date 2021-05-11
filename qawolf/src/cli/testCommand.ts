import program, { Command } from "commander";
import runTests from "./runTests";

export const buildTestCommand = (): program.Command => {
  const command = new Command("test")
    .description(
      "🏃 Run QA Wolf tests, optionally specifying a list of tag names"
    )
    .option(
      "-t, --tags <tags>",
      "comma separated list of tag names (example: Account,Checkout)"
    )
    .option("-e, --env <env>", "environment variables to pass to your tests")
    .option(
      "-n, --env-name <envName>",
      "environment name to use when running your tests"
    )
    .option("-s, --no-wait", "do not wait for the tests finish running")
    .option("-r, --trigger <id>", "deprecated: id of the trigger to run")
    .action(async ({ env, envName, tags, trigger: triggerId, wait }) => {
      await runTests({ env, envName, tags, triggerId, wait });
    });

  return command;
};

import program, { Command } from "commander";
import runTests from "./runTests";

export const buildTestCommand = (): program.Command => {
  const command = new Command("test")
    .description(
      "🏃 Run QA Wolf tests, optionally specifying a list of test tag names"
    )
    .option(
      "-t, --tags <tags>",
      "comma separated list of tag names (example: Account,Checkout)"
    )
    .option(
      "-e, --environment <environment>",
      "environment name to use when running your tests (example: Staging)"
    )
    .option(
      "-v, --variables <variables>",
      "environment variables to pass to your tests"
    )

    .option("-s, --no-wait", "do not wait for the tests finish running")
    .option("-b, --branch <branch>", "git branch of tests to run")
    .option("--trigger <id>", "deprecated: id of the trigger to run")
    .action(
      async ({
        branch,
        environment,
        tags,
        trigger: triggerId,
        variables,
        wait,
      }) => {
        await runTests({
          branch,
          environment,
          tags,
          triggerId,
          variables,
          wait,
        });
      }
    );

  return command;
};

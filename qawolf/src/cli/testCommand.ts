import program, { Command } from "commander";
import runTests from "./runTests";

export const buildTestCommand = (): program.Command => {
  const command = new Command("test")
    .description("🏃 Run QA Wolf tests assigned to the specified trigger")
    .requiredOption("-t, --trigger <id>", "id of the trigger to run")
    .option("-e, --env <env>", "environment variables to pass to your tests")
    .option("-n, --no-wait", "do not wait for the tests finish running")
    .option("-b, --branch <branch>", "the branch of tests to run")
    .action(async ({ branch, env, trigger: triggerId, wait }) => {
      await runTests({ branch, env, triggerId, wait });
    });

  return command;
};

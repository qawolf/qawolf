import { execSync } from "child_process";

export const runJest = (args: string[] = []) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */

  // jest-fail-fast preset overrides the transform, and configures the jasmine-fail-fast plugin
  // --config={} prevents using the local jest config
  let command = `npx jest --preset="@qawolf/jest-fail-fast" --rootDir=.qawolf --testTimeout=60000 --config={}`;

  // pass through other arguments to jest
  if (args.length) {
    command += ` ${args.join(" ")}`;
  }

  // log the command we run to make it clear this is an alias for npx jest
  console.log(command + "\n");

  try {
    execSync(command, { stdio: "inherit" });
    return 0;
  } catch (e) {
    return 1;
  }
};

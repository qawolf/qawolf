import { execSync } from "child_process";

type RunJestOptions = {
  path?: string;
};

export const runJest = (args: string[] = [], options: RunJestOptions = {}) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */

  const rootDir = options.path || ".qawolf";

  // --config={} prevents using the local jest config
  let command = `npx jest --preset="@qawolf/jest-plugin" --rootDir=${rootDir} --testTimeout=60000 --config={}`;

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

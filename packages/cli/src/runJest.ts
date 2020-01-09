import path from "path";
import { execSync } from "child_process";

export const runJest = (args: string[] = []) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */

  // make it relative to the current working directory
  // so the command is shorter when logged
  const config = path.relative(
    process.cwd(),
    path.join(__dirname, "failFast.json")
  );

  // use a config file instead of json because escaping
  // the json for different shells is too difficult
  let command = `npx jest --config=${config} --rootDir=.qawolf --testTimeout=60000`;

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

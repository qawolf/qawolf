import path from "path";
import { execSync } from "child_process";

export const runJest = (args: string[] = []) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */
  const setupFailFast = path.join(
    __dirname,
    __dirname.includes("src") ? "../lib" : "",
    "failFast.js"
  );

  const config = JSON.stringify({
    // assume .qawolf is relative to the current working directory
    roots: ["<rootDir>/.qawolf"],
    // run with fast fail since we do not want to continue e2e tests when one fails
    // this will not be necessary after Jest Circus fixes --bail
    setupFilesAfterEnv: [setupFailFast],
    // override transform to prevent using external babel-jest
    transform: {}
  });

  let command = `npx jest --testTimeout=60000 --config='${config}'`;
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

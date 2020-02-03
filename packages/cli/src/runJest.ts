import { BrowserType } from "@qawolf/types";
import { execSync } from "child_process";

type RunJestOptions = {
  browsers?: BrowserType[];
  path?: string;
  repl?: boolean;
};

const runCommand = (command: string) => {
  // log the command we run to make it clear this is an alias for npx jest
  console.log(command + "\n");
  execSync(command, { stdio: "inherit" });
};

export const runJest = (args: string[] = [], options: RunJestOptions = {}) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */
  // --config={} prevents using the local jest config
  let command = `npx jest --config={} --preset="@qawolf/jest-plugin"`;

  if (options.repl) {
    command += ` --reporters="@qawolf/repl"`;
  }

  const rootDir = options.path || ".qawolf";
  command += ` --rootDir=${rootDir}`;

  if (args.findIndex(a => a.toLowerCase().includes("testtimeout")) < 0) {
    command += " --testTimeout=60000";
  }

  // pass through other arguments to jest
  if (args.length) {
    command += ` ${args.join(" ")}`;
  }

  try {
    if (options.browsers && options.browsers.length) {
      for (let browser of options.browsers) {
        runCommand(`QAW_BROWSER=${browser} ${command}`);
      }
    } else {
      runCommand(command);
    }

    return 0;
  } catch (e) {
    return 1;
  }
};

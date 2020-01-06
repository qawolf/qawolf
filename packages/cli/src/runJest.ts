import path from "path";
import { execSync } from "child_process";

export const runJest = (args: string[] = []) => {
  const setupFailFast = path.join(
    __dirname,
    __dirname.includes("src") ? "../lib" : "",
    "failFast.js"
  );

  const config = JSON.stringify({
    // assume .qawolf is relative to the current working directory
    roots: ["<rootDir>/.qawolf"],
    // run with fast fail since we do not want to continue e2e tests when one fails
    setupFilesAfterEnv: [setupFailFast],
    // override transform to prevent using external babel-jest
    transform: {}
  });

  let command = `npx jest --testTimeout=60000 --config='${config}'`;
  if (args.length) {
    command += ` ${args.join(" ")}`;
  }

  console.log(command + "\n");

  try {
    execSync(command, { stdio: "inherit" });
  } catch (e) {}
};

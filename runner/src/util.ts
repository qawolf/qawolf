import { spawn } from "child_process";
import Debug, { Debugger } from "debug";

interface RunCommandOptions {
  debug: Debugger;
}

export function runCommand(
  cmd: string,
  { debug = Debug("qawolf:runCommand") }: RunCommandOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("sh", ["-c", cmd]);

    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(stderr);
      }
    });
  });
}

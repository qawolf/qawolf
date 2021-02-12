import { spawn } from "child_process";

export function runCommand(cmd: string): Promise<void> {
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

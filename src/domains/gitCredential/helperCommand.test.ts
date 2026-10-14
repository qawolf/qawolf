import { describe, expect, it } from "bun:test";
import { chmod, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defaultSpawn } from "~/shell/spawn.js";

import { resolveHelperCommand } from "./helperCommand.js";

async function writeFakeCli() {
  const directory = join(
    await mkdtemp(join(tmpdir(), "qawolf-helper-")),
    "it's a cli",
  );
  await mkdir(directory);
  const scriptPath = join(directory, "fake qawolf");
  await writeFile(
    scriptPath,
    [
      "#!/bin/sh",
      'if [ "$1 $2 $3" = "auth git-credential get" ]; then',
      "  echo username=qawolf",
      "  echo password=from-the-cli",
      "fi",
      "",
    ].join("\n"),
  );
  await chmod(scriptPath, 0o755);
  return scriptPath;
}

function fillCredential(helper: string) {
  return defaultSpawn(
    "git",
    ["-c", `credential.helper=${helper}`, "credential", "fill"],
    {
      env: {
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_TERMINAL_PROMPT: "0",
      },
      platform: process.platform,
      stdin: "protocol=https\nhost=app.qawolf.com\n\n",
    },
  );
}

describe.skipIf(process.platform === "win32")("resolveHelperCommand", () => {
  it("gives Git a compiled CLI command that survives spaces and quotes in its path", async () => {
    const scriptPath = await writeFakeCli();
    const helper = resolveHelperCommand({
      compiled: true,
      execPath: scriptPath,
      scriptPath: undefined,
    });
    if (helper.status !== "ready") throw Error("expected a command");

    const result = await fillCredential(helper.command);

    expect(result.stdout).toContain("password=from-the-cli\n");
  });

  it("gives Git a Node CLI command that passes the script path to the runtime", async () => {
    const scriptPath = await writeFakeCli();
    const helper = resolveHelperCommand({
      compiled: false,
      execPath: "/bin/sh",
      scriptPath,
    });
    if (helper.status !== "ready") throw Error("expected a command");

    const result = await fillCredential(helper.command);

    expect(result.stdout).toContain("password=from-the-cli\n");
  });
});

describe("resolveHelperCommand for temporary installs", () => {
  it.each([
    "/Users/dev/.npm/_npx/4f2a/node_modules/@qawolf/cli/dist/cli.js",
    "/private/var/folders/x/T/bunx-501-@qawolf/cli@latest/node_modules/@qawolf/cli/dist/cli.js",
  ])("skips Git setup when the CLI runs from %s", (scriptPath) => {
    expect(
      resolveHelperCommand({
        compiled: false,
        execPath: "/usr/local/bin/node",
        scriptPath,
      }),
    ).toEqual({ status: "temporary-install" });
  });
});

import { describe, expect, it } from "bun:test";
import { chmod, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defaultSpawn } from "~/shell/spawn.js";

import { resolveHelperCommand } from "./helperCommand.js";

async function bundleLikeTheBinaryBuild(source: string) {
  const directory = await mkdtemp(join(tmpdir(), "qawolf-define-"));
  const entryPath = join(directory, "entry.ts");
  const bundlePath = join(directory, "entry.js");
  await writeFile(entryPath, source);
  const build = await defaultSpawn(
    process.execPath,
    [
      "build",
      entryPath,
      "--target=bun",
      "--define",
      'process.env.QAWOLF_COMPILED="true"',
      "--outfile",
      bundlePath,
    ],
    { platform: process.platform },
  );
  if (build.exitCode !== 0) throw Error(build.stderr);
  return bundlePath;
}

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

describe("defaultCliInvocation", () => {
  it("reports a compiled CLI when the binary build defines QAWOLF_COMPILED", async () => {
    const helperCommandPath = join(import.meta.dirname, "helperCommand.ts");
    const bundlePath = await bundleLikeTheBinaryBuild(
      [
        `import { defaultCliInvocation } from ${JSON.stringify(helperCommandPath)};`,
        "console.log(defaultCliInvocation().compiled);",
        "",
      ].join("\n"),
    );

    const result = await defaultSpawn(process.execPath, [bundlePath], {
      env: { QAWOLF_COMPILED: undefined },
      platform: process.platform,
    });

    expect(result.stdout.trim()).toBe("true");
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

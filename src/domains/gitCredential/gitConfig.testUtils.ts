import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defaultSpawn, type SpawnFn } from "~/shell/spawn.js";

import { resolveHelperCommand } from "./helperCommand.js";
import type { GitConfigDeps } from "./helperEntries.js";

export const hostUrl = "https://app.qawolf.com";
export const hostHelperKey = `credential.${hostUrl}.helper`;
export const helperCommand = resolveHelperCommand({
  compiled: false,
  execPath: "/usr/local/bin/node",
  scriptPath: "/usr/local/lib/node_modules/@qawolf/cli/dist/cli.js",
});
export const staleCliEntry =
  "!'/old/bin/node' '/old/lib/node_modules/@qawolf/cli/dist/cli.js' auth git-credential";

export async function makeGitConfig({
  contents,
  folderName = "home",
}: {
  contents: string;
  folderName?: string;
}) {
  const directory = join(
    await mkdtemp(join(tmpdir(), "qawolf-git-config-")),
    folderName,
  );
  await mkdir(directory);
  const configPath = join(directory, "gitconfig");
  await writeFile(configPath, contents);
  const environment = {
    GIT_CONFIG_GLOBAL: configPath,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
    HOME: directory,
  };
  const spawn: SpawnFn = (command, args, options) =>
    defaultSpawn(command, args, { ...options, env: environment });
  const deps: GitConfigDeps = { platform: process.platform, spawn };
  async function readValues(key: string) {
    const result = await spawn(
      "git",
      ["config", "--global", "--null", "--get-all", key],
      { platform: process.platform },
    );
    return result.stdout.split("\0").slice(0, -1);
  }
  async function fillPassword() {
    const result = await spawn("git", ["credential", "fill"], {
      platform: process.platform,
      stdin: `protocol=https\nhost=${new URL(hostUrl).host}\n\n`,
    });
    return result.stdout
      .split("\n")
      .find((line) => line.startsWith("password="));
  }
  return { configPath, deps, fillPassword, readValues };
}

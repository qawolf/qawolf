import { describe, expect, it, mock } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defaultSpawn, type SpawnFn } from "~/shell/spawn.js";

import {
  removeGitCredentialHelper,
  setUpGitCredentialHelper,
} from "./gitConfig.js";
import { resolveHelperCommand } from "./helperCommand.js";
import type { GitConfigDeps } from "./helperEntries.js";

const hostUrl = "https://app.qawolf.com";
const helperCommand = resolveHelperCommand({
  compiled: false,
  execPath: "/usr/local/bin/node",
  scriptPath: "/usr/local/lib/node_modules/@qawolf/cli/dist/cli.js",
});
const staleCliEntry =
  "!'/old/bin/node' '/old/lib/node_modules/@qawolf/cli/dist/cli.js' auth git-credential";

async function makeGitConfig(contents: string) {
  const directory = await mkdtemp(join(tmpdir(), "qawolf-git-config-"));
  const configPath = join(directory, "gitconfig");
  await writeFile(configPath, contents);
  const environment = {
    GIT_CONFIG_GLOBAL: configPath,
    GIT_CONFIG_NOSYSTEM: "1",
    HOME: directory,
  };
  const spawn: SpawnFn = (command, args, options) =>
    defaultSpawn(command, args, { ...options, env: environment });
  const deps: GitConfigDeps = { platform: process.platform, spawn };
  async function readValues(key: string) {
    const result = await spawn(
      "git",
      ["config", "--global", "--get-all", key],
      {
        platform: process.platform,
      },
    );
    return result.stdout.split("\n").filter(Boolean);
  }
  return { configPath, deps, readValues };
}

describe("setUpGitCredentialHelper", () => {
  it("adds one helper entry for the QA Wolf host and names the config file", async () => {
    const gitConfig = await makeGitConfig("");
    if (helperCommand.status !== "ready") throw Error("expected a command");

    const first = await setUpGitCredentialHelper({
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });
    const second = await setUpGitCredentialHelper({
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });

    if (first.status !== "added")
      throw Error(`expected added: ${first.status}`);
    expect(first.file).toMatch(/gitconfig$/);
    expect(second.status).toBe("unchanged");
    expect(await gitConfig.readValues(`credential.${hostUrl}.helper`)).toEqual([
      helperCommand.command,
    ]);
  });

  it("keeps the user's own helpers and replaces a stale CLI entry", async () => {
    const gitConfig = await makeGitConfig(
      [
        "[credential]",
        "\thelper = osxkeychain",
        `[credential "${hostUrl}"]`,
        "\thelper = store",
        `\thelper = ${staleCliEntry}`,
        "",
      ].join("\n"),
    );
    if (helperCommand.status !== "ready") throw Error("expected a command");

    await setUpGitCredentialHelper({
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });

    expect(await gitConfig.readValues("credential.helper")).toEqual([
      "osxkeychain",
    ]);
    expect(await gitConfig.readValues(`credential.${hostUrl}.helper`)).toEqual([
      "store",
      helperCommand.command,
    ]);
  });

  it("runs no git command for a temporary install", async () => {
    const spawn = mock(defaultSpawn);

    const result = await setUpGitCredentialHelper({
      deps: { platform: process.platform, spawn },
      helperCommand: { status: "temporary-install" },
      hostUrl,
    });

    expect(result.status).toBe("temporary-install");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("reports a missing git without failing", async () => {
    const spawn: SpawnFn = async () => ({
      exitCode: -1,
      stderr: "",
      stdout: "",
    });
    const deps = { platform: process.platform, spawn };

    expect(
      (await setUpGitCredentialHelper({ deps, helperCommand, hostUrl })).status,
    ).toBe("git-missing");
    expect((await removeGitCredentialHelper({ deps, hostUrl })).status).toBe(
      "git-missing",
    );
  });
});

describe("removeGitCredentialHelper", () => {
  it("removes only the entries that the CLI added", async () => {
    const gitConfig = await makeGitConfig(
      [
        `[credential "${hostUrl}"]`,
        "\thelper = store",
        `\thelper = ${staleCliEntry}`,
        "",
      ].join("\n"),
    );

    const result = await removeGitCredentialHelper({
      deps: gitConfig.deps,
      hostUrl,
    });

    if (result.status !== "removed") {
      throw Error(`expected removed: ${result.status}`);
    }
    expect(result.file).toMatch(/gitconfig$/);
    expect(await gitConfig.readValues(`credential.${hostUrl}.helper`)).toEqual([
      "store",
    ]);
  });

  it("reports nothing to remove when the CLI added no entry", async () => {
    const gitConfig = await makeGitConfig("");

    expect(
      (await removeGitCredentialHelper({ deps: gitConfig.deps, hostUrl }))
        .status,
    ).toBe("none");
  });
});

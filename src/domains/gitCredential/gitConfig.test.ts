import { describe, expect, it, mock } from "bun:test";

import { defaultSpawn, type SpawnFn } from "~/shell/spawn.js";

import {
  removeGitCredentialHelper,
  setUpGitCredentialHelper,
} from "./gitConfig.js";
import {
  helperCommand,
  hostHelperKey,
  hostUrl,
  makeGitConfig,
  staleCliEntry,
} from "./gitConfig.testUtils.js";

describe("setUpGitCredentialHelper", () => {
  it("adds the CLI helper after an empty entry and names the config file", async () => {
    const gitConfig = await makeGitConfig({ contents: "" });
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
    expect(first.file).toBe(gitConfig.configPath);
    expect(second.status).toBe("unchanged");
    expect(await gitConfig.readValues(hostHelperKey)).toEqual([
      "",
      helperCommand.command,
    ]);
  });

  it("makes Git ask the CLI before any helper set earlier in the config", async () => {
    const gitConfig = await makeGitConfig({
      contents: [
        "[credential]",
        `\thelper = "!f() { test \\"$1\\" = get && echo username=qawolf && echo password=stale-token; }; f"`,
        "",
      ].join("\n"),
    });

    await setUpGitCredentialHelper({
      deps: gitConfig.deps,
      helperCommand: {
        command:
          '!f() { test "$3" = get && echo username=qawolf && echo password=cli-token; }; f auth git-credential',
        status: "ready",
      },
      hostUrl,
    });

    expect(await gitConfig.fillPassword()).toBe("password=cli-token");
  });

  it.skipIf(process.platform === "win32")(
    "names a config file whose path holds a backslash",
    async () => {
      const gitConfig = await makeGitConfig({
        contents: "",
        folderName: "back\\slash",
      });

      const result = await setUpGitCredentialHelper({
        deps: gitConfig.deps,
        helperCommand,
        hostUrl,
      });

      if (result.status !== "added") {
        throw Error(`expected added: ${result.status}`);
      }
      expect(result.file).toBe(gitConfig.configPath);
    },
  );

  it("keeps the user's own helpers and replaces the stale CLI entries", async () => {
    const gitConfig = await makeGitConfig({
      contents: [
        "[credential]",
        "\thelper = osxkeychain",
        `[credential "${hostUrl}"]`,
        "\thelper = store",
        "\thelper =",
        `\thelper = ${staleCliEntry}`,
        "",
      ].join("\n"),
    });
    if (helperCommand.status !== "ready") throw Error("expected a command");

    await setUpGitCredentialHelper({
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });

    expect(await gitConfig.readValues("credential.helper")).toEqual([
      "osxkeychain",
    ]);
    expect(await gitConfig.readValues(hostHelperKey)).toEqual([
      "store",
      "",
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

import { describe, expect, it } from "bun:test";

import { setUpGitCredentialHelper } from "./gitConfig.js";
import {
  helperCommand,
  hostHelperKey,
  hostUrl,
  makeGitConfig,
  staleCliEntry,
  teamApiKey,
} from "./gitConfig.testUtils.js";

describe("setUpGitCredentialHelper with a team API key", () => {
  it("removes the CLI entries so Git uses the user's own helpers again", async () => {
    const gitConfig = await makeGitConfig({
      contents: [
        "[credential]",
        `\thelper = "!f() { test \\"$1\\" = get && echo username=me && echo password=keychain-token; }; f"`,
        `[credential "${hostUrl}"]`,
        "\thelper =",
        `\thelper = ${staleCliEntry}`,
        "",
      ].join("\n"),
    });

    const result = await setUpGitCredentialHelper({
      credential: teamApiKey,
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });

    expect(result).toMatchObject({
      removal: { status: "removed" },
      status: "team-api-key",
    });
    expect(await gitConfig.readValues(hostHelperKey)).toEqual([]);
    expect(await gitConfig.fillPassword()).toBe("password=keychain-token");
  });

  it("adds no entry when the CLI added none before", async () => {
    const gitConfig = await makeGitConfig({ contents: "" });

    const result = await setUpGitCredentialHelper({
      credential: teamApiKey,
      deps: gitConfig.deps,
      helperCommand,
      hostUrl,
    });

    expect(result).toMatchObject({
      removal: { status: "none" },
      status: "team-api-key",
    });
    expect(await gitConfig.readValues(hostHelperKey)).toEqual([]);
  });
});

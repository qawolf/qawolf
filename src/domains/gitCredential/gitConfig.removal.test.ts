import { describe, expect, it } from "bun:test";

import { removeGitCredentialHelper } from "./gitConfig.js";
import {
  hostHelperKey,
  hostUrl,
  makeGitConfig,
  staleCliEntry,
} from "./gitConfig.testUtils.js";

describe("removeGitCredentialHelper", () => {
  it("removes only the entries that the CLI added", async () => {
    const gitConfig = await makeGitConfig({
      contents: [
        `[credential "${hostUrl}"]`,
        "\thelper = store",
        "\thelper =",
        `\thelper = ${staleCliEntry}`,
        "",
      ].join("\n"),
    });

    const result = await removeGitCredentialHelper({
      deps: gitConfig.deps,
      hostUrl,
    });

    if (result.status !== "removed") {
      throw Error(`expected removed: ${result.status}`);
    }
    expect(result.file).toBe(gitConfig.configPath);
    expect(await gitConfig.readValues(hostHelperKey)).toEqual(["store"]);
  });

  it("leaves the config alone when the CLI added no entry", async () => {
    const gitConfig = await makeGitConfig({
      contents: [`[credential "${hostUrl}"]`, "\thelper =", ""].join("\n"),
    });

    const result = await removeGitCredentialHelper({
      deps: gitConfig.deps,
      hostUrl,
    });

    expect(result.status).toBe("none");
    expect(await gitConfig.readValues(hostHelperKey)).toEqual([""]);
  });
});

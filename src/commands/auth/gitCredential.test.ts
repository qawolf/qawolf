import { describe, expect, it, mock } from "bun:test";

import { authMessages } from "~/core/messages/index.js";
import type { ApiKeyResult } from "~/domains/auth/types.js";

import {
  type GitCredentialDeps,
  handleGitCredential,
} from "./gitCredential.js";

const qaWolfRequest =
  'protocol=https\nhost=app.qawolf.com\nwwwauth[]=Basic realm="QA Wolf Git"\n\n';

function encodeSegment(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

const sessionToken = `${encodeSegment({ alg: "RS256" })}.${encodeSegment({ exp: 2_000_000_000 })}.signature`;

function makeDeps({
  credential,
  request = qaWolfRequest,
}: {
  credential: ApiKeyResult | undefined;
  request?: string;
}) {
  const written = { error: "", output: "" };
  const deps: GitCredentialDeps = {
    hostUrl: "https://app.qawolf.com",
    readRequest: mock(async () => request),
    resolveCredential: mock(async () => credential),
    writeError: (message) => {
      written.error += message;
    },
    writeOutput: (output) => {
      written.output += output;
    },
  };
  return { deps, written };
}

describe("handleGitCredential", () => {
  it("gives Git the browser session and the time it expires", async () => {
    const { deps, written } = makeDeps({
      credential: {
        key: sessionToken,
        source: "browser",
        workspaceId: undefined,
      },
    });

    await handleGitCredential({ deps, operation: "get" });

    expect(written.output).toBe(
      `username=qawolf\npassword=${sessionToken}\npassword_expiry_utc=2000000000\n`,
    );
    expect(written.error).toBe("");
  });

  it("gives Git a stored user API key without an expiry", async () => {
    const { deps, written } = makeDeps({
      credential: {
        key: "sk_test_user",
        source: "keychain",
        workspaceId: undefined,
      },
    });

    await handleGitCredential({ deps, operation: "get" });

    expect(written.output).toBe("username=qawolf\npassword=sk_test_user\n");
  });

  it("answers nothing for another host", async () => {
    const { deps, written } = makeDeps({
      credential: {
        key: "sk_test_user",
        source: "keychain",
        workspaceId: undefined,
      },
      request: "protocol=https\nhost=github.com\n\n",
    });

    await handleGitCredential({ deps, operation: "get" });

    expect(written).toEqual({ error: "", output: "" });
    expect(deps.resolveCredential).not.toHaveBeenCalled();
  });

  it("tells a signed-out user how to sign in, on stderr only", async () => {
    const { deps, written } = makeDeps({ credential: undefined });

    await handleGitCredential({ deps, operation: "get" });

    expect(written).toEqual({
      error: `${authMessages.gitHelper.signedOut}\n`,
      output: "",
    });
  });

  it("withholds a team API key, which the Git route rejects", async () => {
    const { deps, written } = makeDeps({
      credential: {
        key: "qawolf_teamkey",
        source: "env",
        workspaceId: undefined,
      },
    });

    await handleGitCredential({ deps, operation: "get" });

    expect(written).toEqual({
      error: `${authMessages.gitHelper.teamApiKey}\n`,
      output: "",
    });
  });

  it.each(["store", "erase"])(
    "leaves Git's %s request alone",
    async (operation) => {
      const { deps, written } = makeDeps({
        credential: {
          key: "sk_test_user",
          source: "keychain",
          workspaceId: undefined,
        },
      });

      await handleGitCredential({ deps, operation });

      expect(written).toEqual({ error: "", output: "" });
      expect(deps.readRequest).not.toHaveBeenCalled();
    },
  );
});

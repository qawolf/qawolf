import { describe, expect, it, mock } from "bun:test";

import type { ApiKeyResult } from "~/domains/auth/types.js";
import type { CommandContext } from "~/shell/commandContext.js";
import { makeCtx } from "~/shell/commandContext.testUtils.js";
import type { UI } from "~/shell/ui/index.js";

import { handleLogin } from "./login.js";

const browserSession: ApiKeyResult = {
  key: "access_new",
  source: "browser",
  workspaceId: undefined,
};

function makeHumanCtx(ui: Partial<UI>): CommandContext {
  const ctx = makeCtx("human");
  return { ...ctx, ui: { ...ctx.ui, ...ui } };
}

function chooseBrowser(): Partial<UI> {
  return {
    select: mock(async () => ({ ok: true as const, value: "browser" })),
  };
}

describe("handleLogin and Git", () => {
  it("sets up Git with the credential that a browser sign-in stores", async () => {
    const configureGitCredentialHelper = mock(async () => undefined);
    const resolveApiKey = mock(
      async (): Promise<ApiKeyResult | undefined> => browserSession,
    ).mockResolvedValueOnce(undefined);

    await handleLogin(makeHumanCtx(chooseBrowser()), {
      configureGitCredentialHelper,
      loginWithDevice: mock(async () => undefined),
      resolveApiKey,
    });

    expect(configureGitCredentialHelper).toHaveBeenCalledTimes(1);
    expect(configureGitCredentialHelper).toHaveBeenCalledWith(
      expect.objectContaining({ credential: browserSession }),
    );
  });

  it("leaves Git alone when sign-in ends without a credential", async () => {
    const configureGitCredentialHelper = mock(async () => undefined);

    await handleLogin(makeHumanCtx(chooseBrowser()), {
      configureGitCredentialHelper,
      loginWithDevice: mock(async () => undefined),
      resolveApiKey: mock(async () => undefined),
    });

    expect(configureGitCredentialHelper).not.toHaveBeenCalled();
  });

  it("leaves Git alone when sign-in fails", async () => {
    const configureGitCredentialHelper = mock(async () => undefined);

    await handleLogin(makeHumanCtx(chooseBrowser()), {
      configureGitCredentialHelper,
      loginWithDevice: mock(async () => ({ error: "device flow expired" })),
      resolveApiKey: mock(
        async (): Promise<ApiKeyResult | undefined> => browserSession,
      ).mockResolvedValueOnce(undefined),
    });

    expect(configureGitCredentialHelper).not.toHaveBeenCalled();
  });

  it("sets up Git when the user keeps the existing sign-in", async () => {
    const configureGitCredentialHelper = mock(async () => undefined);

    await handleLogin(
      makeHumanCtx({
        confirm: mock(async () => ({ ok: true as const, value: false })),
      }),
      {
        configureGitCredentialHelper,
        resolveApiKey: mock(async () => browserSession),
      },
    );

    expect(configureGitCredentialHelper).toHaveBeenCalledTimes(1);
  });
});

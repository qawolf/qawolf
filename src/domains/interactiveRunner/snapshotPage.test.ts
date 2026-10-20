import { publicContractsV1 } from "@qawolf/api-contracts/v1";
import { describe, expect, it } from "bun:test";

import { makeAuthCtx, makeTestDeps } from "./deps.testUtils.js";
import { runnerCallOptions } from "./runnerCallOptions.js";
import { handleRunnerSnapshotPage } from "./snapshotPage.js";

describe("handleRunnerSnapshotPage", () => {
  it("prints the url, the title and the outline as plain text", async () => {
    const { callPublicApi, ctx, streamed } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: {
        outcome: "success",
        snapshot: '- button "Save" [ref=e4]',
        title: "Settings",
        url: "https://example.com/settings",
      },
    });

    expect(
      await handleRunnerSnapshotPage(
        ctx,
        { interactiveOnly: true, runner: "ci" },
        makeTestDeps(),
      ),
    ).toBeUndefined();

    expect(callPublicApi).toHaveBeenCalledWith(
      publicContractsV1.runner.snapshotPage,
      { id: "ci", interactiveOnly: true },
      runnerCallOptions,
    );
    expect(streamed()).toEqual([
      'url: https://example.com/settings\ntitle: Settings\n\n- button "Save" [ref=e4]',
    ]);
  });

  it("refuses without a runner rather than launching one", async () => {
    const { callPublicApi, ctx } = makeAuthCtx();

    const result = await handleRunnerSnapshotPage(
      ctx,
      { interactiveOnly: false, runner: undefined },
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(2);
    expect(callPublicApi).not.toHaveBeenCalled();
  });

  it.each([
    ["no-page", 2, "no page open"],
    ["no-answer", 4, "did not answer"],
    ["page-snapshots-not-enabled", 2, "not turned on for your team"],
    ["runner-cannot-snapshot-pages", 2, "no web browser"],
    ["runner-unreachable", 4, "could not be reached"],
  ])("reports %s", async (failureReason, exitCode, text) => {
    const { callPublicApi, ctx } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: { failureReason, outcome: "failure" },
    });

    const result = await handleRunnerSnapshotPage(
      ctx,
      { interactiveOnly: false, runner: "ci" },
      makeTestDeps(),
    );

    expect(result?.exitCode).toBe(exitCode);
    expect(result?.error).toContain(text);
  });

  it("keeps the runner's own reason for a failure", async () => {
    const { callPublicApi, ctx } = makeAuthCtx();
    callPublicApi.mockResolvedValue({
      ok: true,
      value: {
        errorMessage: "The page did not answer in time.",
        failureReason: "no-answer",
        outcome: "failure",
      },
    });

    const result = await handleRunnerSnapshotPage(
      ctx,
      { interactiveOnly: false, runner: "ci" },
      makeTestDeps(),
    );

    expect(result?.error).toContain("The page did not answer in time.");
  });
});
